#!/usr/bin/env bash
set -euo pipefail
[[ "${GITHUB_ACTIONS:-false}" == "true" ]] || exit 1
: "${ANDROID_HOME:?Falta Android SDK}"
: "${ANDROID_AVD_HOME:?Falta almacenamiento del AVD}"
mkdir -p "$ANDROID_AVD_HOME" artifacts/android-local
available=$(df -Pm "$ANDROID_AVD_HOME" | awk 'NR==2 {print $4}')
echo "Espacio disponible para el AVD: ${available} MB"
(( available >= 8500 )) || { echo "Faltan al menos 8500 MB libres para crear y ejecutar el AVD."; exit 1; }
printf 'no\n' | avdmanager create avd --name qa_ci --package 'system-images;android-33;default;x86_64' --device pixel_2 --path "$ANDROID_AVD_HOME/qa_ci.avd" --force
config="$ANDROID_AVD_HOME/qa_ci.avd/config.ini"
sed -i '/^disk.dataPartition.size=/d; /^hw.ramSize=/d; /^hw.cpu.ncore=/d' "$config"
printf '\ndisk.dataPartition.size=2048M\nhw.ramSize=2048\nhw.cpu.ncore=2\n' >> "$config"
cp "$config" artifacts/android-local/avd-config.ini
"$ANDROID_HOME/emulator/emulator" -avd qa_ci -port 5554 -no-window -no-snapshot -gpu swiftshader_indirect -noaudio -no-boot-anim -camera-back none -memory 2048 -partition-size 2048 -accel on > artifacts/android-local/emulator.log 2>&1 < /dev/null &
pid=$!
echo "$pid" > artifacts/android-local/emulator.pid
for (( attempt=1; attempt<=90; attempt++ )); do
  if ! kill -0 "$pid" 2>/dev/null; then
    echo "El proceso del emulador terminó antes de completar el arranque."
    tail -n 100 artifacts/android-local/emulator.log
    exit 1
  fi
  boot=$(adb -s emulator-5554 shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
  if [[ "$boot" == "1" ]]; then
    adb -s emulator-5554 shell input keyevent 82
    adb -s emulator-5554 shell settings put global window_animation_scale 0
    adb -s emulator-5554 shell settings put global transition_animation_scale 0
    adb -s emulator-5554 shell settings put global animator_duration_scale 0
    adb devices
    echo "Android listo para instalar la APK."
    exit 0
  fi
  sleep 2
done
echo "Android no completó el arranque en 180 segundos."
tail -n 100 artifacts/android-local/emulator.log
exit 1
