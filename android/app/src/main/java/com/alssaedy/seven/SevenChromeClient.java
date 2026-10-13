package com.alssaedy.seven;

import android.content.ActivityNotFoundException;
import android.net.Uri;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.widget.Toast;

// Handles permission grants and the file chooser used by the backup import.
// A named class is used instead of an anonymous inner class (see MainActivity).
class SevenChromeClient extends WebChromeClient {

    private final MainActivity activity;

    SevenChromeClient(MainActivity activity) {
        this.activity = activity;
    }

    @Override
    public void onPermissionRequest(final PermissionRequest request) {
        request.grant(request.getResources());
    }

    @Override
    public boolean onShowFileChooser(WebView view,
                                     ValueCallback<Uri[]> filePathCallback,
                                     FileChooserParams fileChooserParams) {
        if (activity.pendingFileCallback != null) {
            activity.pendingFileCallback.onReceiveValue(null);
        }
        activity.pendingFileCallback = filePathCallback;
        try {
            activity.startActivityForResult(
                    fileChooserParams.createIntent(), MainActivity.FILE_CHOOSER_REQUEST);
        } catch (ActivityNotFoundException e) {
            activity.pendingFileCallback = null;
            Toast.makeText(activity, "تعذّر فتح منتقي الملفات", Toast.LENGTH_SHORT).show();
            return false;
        }
        return true;
    }
}
