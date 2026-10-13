#!/usr/bin/env bash
# SEVEN — build a signed debug APK from the PWA sources, without Gradle.
# Requires: JDK 17+, Android SDK (build-tools + platforms) at $ANDROID_HOME.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_HOME="${ANDROID_HOME:-$HOME/android-sdk}"
BT_VER="${BT_VER:-34.0.0}"
PLATFORM="${PLATFORM:-android-34}"
BT="$ANDROID_HOME/build-tools/$BT_VER"
JAR="$ANDROID_HOME/platforms/$PLATFORM/android.jar"
APP="$ROOT/android/app/src/main"
OUT="$ROOT/android/build"
DIST="$ROOT/dist"

for t in "$BT/aapt2" "$BT/d8" "$BT/zipalign" "$BT/apksigner" "$JAR"; do
  [ -e "$t" ] || { echo "Missing required tool: $t" >&2; exit 1; }
done

echo "==> Syncing web assets into assets/www"
rm -rf "$APP/assets/www"
mkdir -p "$APP/assets/www"
cp -r "$ROOT/index.html" "$ROOT/manifest.webmanifest" "$ROOT/sw.js" \
      "$ROOT/src" "$ROOT/assets" "$APP/assets/www/"

echo "==> Compiling resources (aapt2)"
rm -rf "$OUT"; mkdir -p "$OUT/res" "$OUT/gen" "$OUT/classes" "$OUT/dex" "$DIST"
"$BT/aapt2" compile --dir "$APP/res" -o "$OUT/res/resources.zip"

echo "==> Linking resources (aapt2)"
"$BT/aapt2" link \
  -o "$OUT/base.apk" \
  -I "$JAR" \
  --manifest "$APP/AndroidManifest.xml" \
  -A "$APP/assets" \
  --java "$OUT/gen" \
  --min-sdk-version 24 --target-sdk-version 34 \
  --version-code 1 --version-name 1.0 \
  "$OUT/res/resources.zip"

echo "==> Compiling Java"
find "$APP/java" "$OUT/gen" -name '*.java' > "$OUT/sources.txt"
javac -nowarn --release 11 -encoding UTF-8 \
  -classpath "$JAR" \
  -d "$OUT/classes" @"$OUT/sources.txt"

echo "==> Dexing (d8)"
"$BT/d8" --min-api 24 --lib "$JAR" --output "$OUT/dex" \
  $(find "$OUT/classes" -name '*.class')

echo "==> Packaging APK"
cp "$OUT/base.apk" "$OUT/unsigned.apk"
(cd "$OUT/dex" && zip -q -X "$OUT/unsigned.apk" classes.dex)

echo "==> Aligning"
"$BT/zipalign" -f -p 4 "$OUT/unsigned.apk" "$OUT/aligned.apk"

echo "==> Signing (debug keystore)"
KS="$OUT/debug.keystore"
if [ ! -f "$KS" ]; then
  keytool -genkeypair -keystore "$KS" -storepass android -keypass android \
    -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks "$KS" --ks-pass pass:android --key-pass pass:android \
  --ks-key-alias androiddebugkey --out "$DIST/SEVEN-1.0-debug.apk" "$OUT/aligned.apk"

"$BT/apksigner" verify --print-certs "$DIST/SEVEN-1.0-debug.apk" | head -3
echo "==> APK: $DIST/SEVEN-1.0-debug.apk"
ls -la "$DIST/SEVEN-1.0-debug.apk"
