# Stitch MCP proxy

A tiny pass-through HTTP proxy that lets local MCP clients reach the Stitch MCP
server. It forwards every request to `https://stitch.googleapis.com/mcp` and
injects the `X-Goog-Api-Key` header from the `STITCH_API_KEY` environment
variable. The key is never written to the repository.

## Why this exists

The platform MCP integration is started by a bootstrap script. When that script
is not present at container start, the Stitch MCP tools do not appear in the
session. Keeping this file in the repository means it is available in every
fresh container/session.

## Run

```bash
export STITCH_API_KEY=...        # Google API key for Stitch
python3 tools/stitch-proxy/stitch_proxy.py
# stitch-proxy listening on http://127.0.0.1:8765/mcp -> https://stitch.googleapis.com/mcp
```

Point an MCP client using the HTTP transport at:

```
http://127.0.0.1:8765/mcp
```

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `STITCH_API_KEY` | (required) | API key sent as `X-Goog-Api-Key`. |
| `STITCH_PROXY_HOST` | `127.0.0.1` | Bind address. |
| `STITCH_PROXY_PORT` | `8765` | Bind port. |
| `STITCH_MCP_URL` | `https://stitch.googleapis.com/mcp` | Upstream endpoint. |
| `STITCH_PROXY_TIMEOUT` | `120` | Upstream timeout, seconds. |
| `STITCH_PROXY_VERBOSE` | unset | Log every request line. |

`--host` and `--port` flags override the host/port variables.
