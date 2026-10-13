#!/usr/bin/env python3
"""Local pass-through proxy for the Stitch MCP server.

Forwards MCP HTTP requests to https://stitch.googleapis.com/mcp, injecting the
``X-Goog-Api-Key`` header read from the ``STITCH_API_KEY`` environment variable.
The key is never stored in this file or in the repository.

Environment:
    STITCH_API_KEY     required; Google API key for Stitch.
    STITCH_PROXY_HOST  optional; bind address (default 127.0.0.1).
    STITCH_PROXY_PORT  optional; bind port (default 8765).
    STITCH_MCP_URL     optional; upstream URL (default the Stitch endpoint).

Usage:
    STITCH_API_KEY=... python3 tools/stitch-proxy/stitch_proxy.py
    Point an MCP client (http transport) at http://127.0.0.1:8765/mcp
"""

from __future__ import annotations

import argparse
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

DEFAULT_UPSTREAM = "https://stitch.googleapis.com/mcp"

# Hop-by-hop headers must not be forwarded.
HOP_BY_HOP = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}

# Response headers worth relaying to keep MCP sessions working.
RELAY_RESPONSE_HEADERS = {"content-type", "cache-control", "mcp-session-id", "mcp-protocol-version"}


def upstream_url() -> str:
    return os.environ.get("STITCH_MCP_URL", DEFAULT_UPSTREAM)


class StitchProxyServer(ThreadingHTTPServer):
    daemon_threads = True

    def handle_error(self, request, client_address):
        # Connection resets/broken pipes are expected when a client aborts;
        # keep the server log clean for those.
        exc = sys.exc_info()[1]
        if isinstance(exc, (BrokenPipeError, ConnectionResetError)):
            return
        super().handle_error(request, client_address)


class StitchProxyHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"
    server_version = "stitch-proxy/1.0"

    def log_message(self, fmt, *args):  # noqa: D401
        if os.environ.get("STITCH_PROXY_VERBOSE"):
            super().log_message(fmt, *args)

    def _forward(self) -> None:
        api_key = os.environ.get("STITCH_API_KEY")
        if not api_key:
            self._json_error(500, "STITCH_API_KEY is not set. Export the key before starting the proxy.")
            return

        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else None

        headers = {name: value for name, value in self.headers.items() if name.lower() not in HOP_BY_HOP}
        headers["X-Goog-Api-Key"] = api_key
        if body is not None and not any(k.lower() == "content-type" for k in headers):
            headers["Content-Type"] = "application/json"

        req = Request(upstream_url(), data=body, headers=headers, method=self.command)
        try:
            with urlopen(req, timeout=float(os.environ.get("STITCH_PROXY_TIMEOUT", "120"))) as resp:
                self._relay(resp.status, resp.headers, resp)
        except HTTPError as err:
            self._relay(err.code, err.headers, err)  # relay upstream errors verbatim
        except URLError as err:
            self._json_error(502, f"Upstream request failed: {err.reason}")
        except Exception as err:  # noqa: BLE001 - surface any failure to the client
            self._json_error(500, f"Proxy error: {err}")

    def _relay(self, status: int, headers, stream) -> None:
        self.send_response(status)
        for name, value in headers.items():
            if name.lower() in RELAY_RESPONSE_HEADERS:
                self.send_header(name, value)
        # Chunked so streaming (SSE) responses relay without buffering.
        self.send_header("Transfer-Encoding", "chunked")
        self.end_headers()
        try:
            while True:
                chunk = stream.read(4096)
                if not chunk:
                    break
                self.wfile.write(b"%X\r\n%s\r\n" % (len(chunk), chunk))
                self.wfile.flush()
            self.wfile.write(b"0\r\n\r\n")
        except (BrokenPipeError, ConnectionResetError):
            pass

    def _json_error(self, status: int, message: str) -> None:
        payload = {
            "jsonrpc": "2.0",
            "error": {"code": status, "message": message},
        }
        data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(data)
        self.close_connection = True

    def do_GET(self):  # noqa: N802 - required by BaseHTTPRequestHandler
        self._forward()

    def do_POST(self):  # noqa: N802
        self._forward()

    def do_DELETE(self):  # noqa: N802
        self._forward()


def main() -> int:
    parser = argparse.ArgumentParser(description="Stitch MCP pass-through proxy")
    parser.add_argument("--host", default=os.environ.get("STITCH_PROXY_HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("STITCH_PROXY_PORT", "8765")))
    args = parser.parse_args()

    if not os.environ.get("STITCH_API_KEY"):
        print("warning: STITCH_API_KEY is not set; requests will fail until it is exported.", file=sys.stderr)

    server = StitchProxyServer((args.host, args.port), StitchProxyHandler)
    print(f"stitch-proxy listening on http://{args.host}:{args.port}/mcp -> {upstream_url()}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
