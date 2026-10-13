# SEVEN — Android build

The Android app is a thin native shell around the same offline PWA in `src/`.
The web assets are bundled under `app/src/main/assets/www/` and served to the
WebView from the https origin `appassets.androidplatform.net`, so the service
worker and secure APIs behave exactly as they do in a browser.

## Output

`dist/SEVEN-1.0-debug.apk` — signed debug APK, `com.alssaedy.seven`, min SDK 24,
target SDK 34.

## Build

Requires a JDK and the Android SDK (build-tools 34.0.0 + platform android-34).

```bash
export ANDROID_HOME=$HOME/android-sdk
bash tools/build_apk.sh
```

The script compiles resources with `aapt2`, compiles the Java sources, dexes
with `d8`, packages, aligns, and signs with a generated debug keystore. It does
not require Gradle.

## Notes

- Web assets are copied into `assets/www` on every build from the repository
  root, so there is a single source of truth for the application code.
- `WebViewClient`/`WebChromeClient` are named classes rather than anonymous
  inner classes: build-tools 34.0.0's `d8` (R8 8.2.2) crashes on anonymous
  subclasses of framework types.
