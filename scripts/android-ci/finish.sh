#!/usr/bin/env bash
set -uo pipefail
mkdir -p artifacts/android-local
adb devices > artifacts/android-local/dispositivos-finales.txt 2>&1 || true
if adb -s emulator-5554 get-state >/dev/null 2>&1; then
  timeout 10s adb -s emulator-5554 logcat -d -b crash -t 100 > artifacts/android-local/cierres-finales.log 2>&1 || true
fi
if [[ -f artifacts/android-local/appium.pid ]]; then
  kill -TERM "$(cat artifacts/android-local/appium.pid)" 2>/dev/null || true
fi
adb -s emulator-5554 emu kill >/dev/null 2>&1 || true
if [[ -f artifacts/android-local/emulator.pid ]]; then
  kill -TERM "$(cat artifacts/android-local/emulator.pid)" 2>/dev/null || true
fi
