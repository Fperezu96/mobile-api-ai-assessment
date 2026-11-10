param(
  [string]$SdkRoot = 'C:\dev\.tools\android-sdk',
  [string]$AvdHome = 'C:\dev\.tools\android-avd',
  [string]$AvdName = 'QA_API33',
  [int]$Port = 5554
)
$ErrorActionPreference = 'Stop'
$emulator = Join-Path $SdkRoot 'emulator\emulator.exe'
$adb = Join-Path $SdkRoot 'platform-tools\adb.exe'
if (!(Test-Path $emulator) -or !(Test-Path $adb)) { throw 'Faltan Android Emulator o platform-tools en el SDK indicado.' }
if (!(Test-Path (Join-Path $AvdHome "$AvdName.ini"))) { throw "No existe el AVD $AvdName en $AvdHome." }
# Estas variables solo afectan a este proceso y a sus hijos.
$env:ANDROID_HOME = $SdkRoot
$env:ANDROID_SDK_ROOT = $SdkRoot
$env:ANDROID_AVD_HOME = $AvdHome
$serial = "emulator-$Port"
$devices = & $adb devices
if ($devices -match "^$serial\s+device") {
  Write-Output "$serial ya esta conectado."
  exit 0
}
$running = Get-CimInstance Win32_Process -Filter "name='qemu-system-x86_64.exe' or name='emulator.exe'" |
  Where-Object { $_.CommandLine -match [regex]::Escape($AvdName) }
if ($running) { throw 'El AVD ya esta arrancando; comprueba adb devices antes de volver a iniciarlo.' }
& $emulator -accel-check
if ($LASTEXITCODE -ne 0) { throw 'La aceleracion del emulador no esta disponible.' }
$evidence = Join-Path $PSScriptRoot '../../artifacts/android-local'
[IO.Directory]::CreateDirectory($evidence) | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
# No se borran datos ni snapshots del dispositivo.
Start-Process -FilePath $emulator -ArgumentList @('-avd', $AvdName, '-port', $Port, '-no-boot-anim') -RedirectStandardOutput (Join-Path $evidence "$stamp-stdout.log") -RedirectStandardError (Join-Path $evidence "$stamp-stderr.log") | Out-Null
Write-Output "Arranque solicitado para $AvdName ($serial). Comprueba sys.boot_completed antes de instalar la app."
