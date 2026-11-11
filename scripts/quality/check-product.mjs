import fs from 'node:fs';
const product=process.argv[2];
if(!['api','android'].includes(product))throw Error('Producto desconocido');
const paths=product==='api'?['config/api/playwright.config.ts','tests/api/specs/bookings.spec.ts']:['config/mobile/playwright.config.ts','apps/android-manifest.json','scripts/android-ci/start-emulator.sh','scripts/android-ci/start-appium.sh'];
for(const file of paths){if(!fs.statSync(file).isFile())throw Error('Falta '+file);}
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
for(const name of ['typecheck',product==='api'?'test:api':'test:mobile:selected'])if(!pkg.scripts[name])throw Error('Falta script '+name);
console.log('Preparación verificada: '+product);
