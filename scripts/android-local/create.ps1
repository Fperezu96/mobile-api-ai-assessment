$ErrorActionPreference='Stop'
$sdk='C:\dev\.tools\android-sdk'
$avdHome='C:\dev\.tools\android-avd'
$avdPath=Join-Path $avdHome 'QA_API33.avd'
if(!(Test-Path "$sdk\system-images\android-33\default\x86_64\system.img")){throw 'La imagen todavia no esta instalada'}
if(Test-Path "$avdHome\QA_API33.ini"){throw 'El AVD ya existe; no se sobrescribe'}
[IO.Directory]::CreateDirectory($avdPath)|Out-Null
$config=@"
AvdId=QA_API33
avd.ini.displayname=QA Android 13 API 33
abi.type=x86_64
hw.cpu.arch=x86_64
hw.cpu.ncore=2
hw.ramSize=3072
hw.lcd.width=1080
hw.lcd.height=1920
hw.lcd.density=420
hw.keyboard=yes
hw.gpu.enabled=yes
hw.gpu.mode=auto
hw.audioInput=no
hw.camera.back=none
hw.camera.front=none
hw.battery=yes
hw.gps=yes
hw.sensors.orientation=yes
hw.sensors.proximity=yes
disk.dataPartition.size=4G
image.sysdir.1=$sdk\system-images\android-33\default\x86_64\
tag.id=default
tag.display=Default
target=android-33
PlayStore.enabled=false
showDeviceFrame=no
"@
$ini="avd.ini.encoding=UTF-8`npath=$avdPath`ntarget=android-33`n"
[IO.File]::WriteAllText("$avdPath\config.ini",$config,[Text.UTF8Encoding]::new($false))
[IO.File]::WriteAllText("$avdHome\QA_API33.ini",$ini,[Text.UTF8Encoding]::new($false))
# Registrar el dispositivo en Android Studio sin mover su almacenamiento.
$defaultAvd=Join-Path $env:USERPROFILE '.android\avd'
[IO.Directory]::CreateDirectory($defaultAvd)|Out-Null
if(!(Test-Path "$defaultAvd\QA_API33.ini")){
  [IO.File]::WriteAllText("$defaultAvd\QA_API33.ini",$ini,[Text.UTF8Encoding]::new($false))
}
Write-Output 'AVD QA_API33 creado en almacenamiento separado.'
