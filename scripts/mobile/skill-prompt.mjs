import { readFileSync } from 'node:fs';
const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Uso: npm.cmd run skill:prompt -- --id CART-03 --scenario "Objetivo, datos y resultado esperado"');
  process.exit(0);
}
const values = {};
for (let index = 0; index < args.length; index += 2) {
  const key = args[index];
  if (!['--id', '--scenario'].includes(key) || !args[index + 1] || values[key]) {
    console.error('Usar --id y --scenario una sola vez, cada uno con su valor. Consultar --help.');
    process.exit(2);
  }
  values[key] = args[index + 1];
}
if (!/^[A-Z][A-Z0-9]*-[0-9]{2,3}$/.test(values['--id'] || '') || !values['--scenario']?.trim()) {
  console.error('Indicar ID como CART-03 y un escenario no vacío.');
  process.exit(2);
}
const skillPath = '.agents/skills/mobile-native-tests/SKILL.md';
readFileSync(skillPath, 'utf8');
console.log([
  'Lee ' + skillPath + ' y sus referencias; usa el skill mobile-native-tests.',
  'Caso: ' + values['--id'] + '. Pedido: ' + values['--scenario'],
  'Revisa casos existentes antes de agregar código; fija esperado y fuente.',
  'Usa las capas actuales, pasos en español y tags como metadatos.',
  'Ejecuta typecheck, descubrimiento por ID y el caso sobre Android local disponible.',
  'Conserva fallos y evidencia; registra revisión del skill, comandos, runId y límites.',
  'No uses nube ni credenciales en el prompt. Si falta una herramienta, declara el bloqueo.'
].join('\n'));
