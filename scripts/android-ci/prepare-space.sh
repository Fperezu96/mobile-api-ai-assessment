#!/usr/bin/env bash
set -euo pipefail
[[ "${GITHUB_ACTIONS:-false}" == "true" ]] || { echo "Solo ejecutar en la VM efímera de GitHub Actions."; exit 1; }
mkdir -p artifacts/android-local
df -h / | tee artifacts/android-local/disco-antes.txt
# No se usan .NET, NDK ni CodeQL para probar una APK ya compilada.
for directory in /usr/share/dotnet /opt/hostedtoolcache/CodeQL "${ANDROID_HOME:-/usr/local/lib/android/sdk}/ndk"; do
  if [[ -d "$directory" ]]; then sudo rm -rf -- "$directory"; fi
done
df -h / | tee artifacts/android-local/disco-despues.txt
echo "ANDROID_AVD_HOME=$RUNNER_TEMP/android-avd" >> "$GITHUB_ENV"
