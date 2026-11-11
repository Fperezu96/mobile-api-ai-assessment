#!/usr/bin/env bash
set -euo pipefail
mkdir -p artifacts/android-local
node scripts/mobile/appium.mjs start > artifacts/android-local/appium-launcher.log 2>&1 < /dev/null &
echo "$!" > artifacts/android-local/appium.pid
if ! node --input-type=module -e "import {waitForAppium} from './scripts/mobile/wait-for-appium.mjs'; await waitForAppium();"; then
  tail -n 100 artifacts/android-local/appium-launcher.log
  exit 1
fi
echo "Appium respondió listo en /status."
