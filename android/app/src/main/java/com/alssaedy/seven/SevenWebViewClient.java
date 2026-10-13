package com.alssaedy.seven;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;

// Serves bundled assets for requests to the app's https origin. A named class is
// used instead of an anonymous inner class (see MainActivity).
class SevenWebViewClient extends WebViewClient {

    private final MainActivity activity;

    SevenWebViewClient(MainActivity activity) {
        this.activity = activity;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        if (url == null || !MainActivity.APP_HOST.equals(url.getHost())) return null;
        return activity.serveAsset(url.getPath());
    }
}
