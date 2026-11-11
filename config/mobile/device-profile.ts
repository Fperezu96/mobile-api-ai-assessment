import { readFileSync } from 'node:fs';
import path from 'node:path';

export type AndroidDeviceProfile = Readonly<{
  name: string;
  deviceName: string;
  udid: string;
  systemPort: number;
  mjpegServerPort: number;
}>;
export type MobileOptions = { deviceProfile: AndroidDeviceProfile };

export function selectedDeviceProfiles(): AndroidDeviceProfile[] {
  const profiles = JSON.parse(readFileSync(path.resolve('config/mobile/devices.json'), 'utf8')) as AndroidDeviceProfile[];
  if (!Array.isArray(profiles) || profiles.length === 0) throw new Error('No hay perfiles Android configurados.');
  const names = process.env.MOBILE_DEVICES?.split(',').map(name => name.trim());
  if (names?.some(name => !name) || (names && new Set(names).size !== names.length)) throw new Error('MOBILE_DEVICES contiene nombres vacíos o repetidos.');
  const selected = (names || [profiles[0].name]).map(name => {
    const profile = profiles.find(device => device.name === name);
    if (!profile) throw new Error('Perfil desconocido: ' + name);
    // Las variables heredadas de CI solo ajustan el modo de un dispositivo.
    return names ? {...profile} : {
      ...profile, udid: process.env.ANDROID_UDID || profile.udid,
      deviceName: process.env.ANDROID_DEVICE_NAME || profile.deviceName,
      systemPort: Number(process.env.ANDROID_SYSTEM_PORT || profile.systemPort),
      mjpegServerPort: Number(process.env.ANDROID_MJPEG_PORT || profile.mjpegServerPort),
    };
  });
  const udids = new Set<string>();
  const ports = new Set<number>([Number(process.env.APPIUM_PORT || 4723)]);
  for (const profile of selected) {
    if (!profile.name || !profile.deviceName || !profile.udid) throw new Error('Perfil Android incompleto.');
    if (udids.has(profile.udid)) throw new Error('Dos proyectos intentan usar el mismo UDID: ' + profile.udid);
    udids.add(profile.udid);
    for (const port of [profile.systemPort, profile.mjpegServerPort]) {
      if (!Number.isInteger(port) || port < 1024 || port > 65535 || ports.has(port)) throw new Error('Puerto inválido o repetido entre sesiones: ' + port);
      ports.add(port);
    }
  }
  return selected;
}
