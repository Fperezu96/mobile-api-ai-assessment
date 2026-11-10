import { PNG } from 'pngjs';
import type { ColorObservation } from '../models/color-observation.js';
// Muestrear el centro evita comparar bordes, escalados o metadatos del PNG.
export function centerColor(screenshot: Buffer): ColorObservation {
  const image = PNG.sync.read(screenshot);
  const index = (Math.floor(image.height / 2) * image.width + Math.floor(image.width / 2)) * 4;
  return {red: image.data[index], green: image.data[index + 1], blue: image.data[index + 2]};
}
