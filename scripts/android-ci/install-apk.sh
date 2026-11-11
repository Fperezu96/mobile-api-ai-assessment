#!/usr/bin/env bash
set -euo pipefail
apk=$(node -p "'apps/downloads/' + JSON.parse(require('node:fs').readFileSync('apps/android-manifest.json','utf8')).filename")
adb -s emulator-5554 get-state
adb -s emulator-5554 install -r "$apk"
adb -s emulator-5554 shell pm path com.saucelabs.mydemoapp.android | tee artifacts/android-local/paquete-instalado.txt
grep -q '^package:' artifacts/android-local/paquete-instalado.txt
echo "APK instalada; Appium creará después una sesión aislada para cada caso."
