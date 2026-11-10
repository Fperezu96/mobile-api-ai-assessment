# Automatización móvil nativa y API

Proyecto de Felipe Pérez Upegui. Playwright Test ejecuta y reporta las dos suites en TypeScript. Las APIs usan APIRequestContext; Android usa WebdriverIO como cliente de Appium y UiAutomator2. Las pruebas móviles no crean un navegador.

## Última ejecución comprobada

Regresión ampliada 2026-11-10T21-40-59-483Z: 8/8 API y 18/39 Android aprobadas en ese intento; catálogo 5/24. Los cierres y el login permisivo se conservan. La espera de eliminación se corrigió y el caso aprobó en 2026-11-10T21-59-19-091Z, junto con una muestra de compras por semilla. Consultar [resultados](docs/resultados.md) para diferenciar hallazgos de la app y correcciones de automatización. No se suman intentos como casos nuevos ni se ocultan fallos.

## Preparación

Node 22.18.0 y npm 10.9.3. Para Android se requieren Java, SDK, Emulator y Build Tools 35. Appium 3.9.0 y UiAutomator2 6.0.0 quedan fijados en package-lock.json; no se requiere instalación global.

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run app:download
npm.cmd run android:local:start
npm.cmd run appium:doctor
```

Crear `.env` desde `.env.example` y configurar BOOKER_USERNAME/BOOKER_PASSWORD con las credenciales del servicio de práctica. No subir secretos. En este PC: SDK `C:\dev\.tools\android-sdk`, AVD `C:\dev\.tools\android-avd`, emulador QA_API33/Android 13. Las rutas se configuran por variables del proceso; no se cambian herramientas globales.

## Ejecutar y consultar resultados

Con el emulador listo y el puerto Appium libre, los comandos conjuntos inician Appium, esperan `/status`, ejecutan ambas suites y cierran únicamente el servidor que crearon. Propagan un código distinto de cero ante fallos.

| Comando | Selección y requisito |
| --- | --- |
| `npm.cmd run test:all:smoke` | 5 casos: API de reserva, carrito con 1/2 unidades, Back y usuario vacío |
| `npm.cmd run test:all:regression` | 47 casos: 8 API y 39 Android, incluidos los hallazgos conocidos |
| `npm.cmd run test:all` | Equivale a la regresión conjunta |
| `npm.cmd run test:all:list` | Descubrimiento; no ejecuta pruebas ni crea sesiones |
| `npm.cmd run report:all` | Abre el último reporte conjunto |
| `npm.cmd run test:api` | Los 8 casos API; no requiere Appium |
| `npm.cmd run test:api:smoke` / `test:api:regression` | Selección API por etiqueta |
| `npm.cmd run test:api:negative` / `test:api:crud` | Rechazos API o ciclo de reservas |
| `npm.cmd run report:api` | Abre el último reporte API independiente |
| `npm.cmd run test:mobile:ci` | Regresión Android con servidor gestionado; MOBILE_SUITE admite smoke/regression/catalog/exploratory |
| `npm.cmd run test:mobile:smoke` / `test:mobile:regression` | Android con Appium ya iniciado manualmente |
| `npm.cmd run test:mobile:negative` / `test:mobile:native` | Negativos o gestos nativos; Appium manual |
| `npm.cmd run report:mobile` | Abre el último reporte móvil independiente |

Para los comandos móviles manuales, dejar `npm.cmd run appium:start` en otra terminal. No ejecutar dos suites ni Inspector sobre el mismo UDID. `report:all`, `report:api` y `report:mobile` admiten `-- <runId>` para consultar un intento anterior. Una selección smoke aprobada no convierte en aprobados los negativos fallidos de regresión.

## Etiquetas y documentación viva

Las etiquetas son metadatos reales de Playwright, combinables con `--grep`: `@api`, `@mobile`, `@smoke`, `@regression`, `@negative`, `@crud`, `@authorization`, `@isolation`, `@characterization`, `@native`, `@back`, `@scroll`, `@cart`, `@login` y `@known-issue`. Esta última identifica un hallazgo y no omite ni altera su resultado.

Cada escenario expresa comportamiento observable con pasos Dado/Cuando/Entonces/Y. Se usa `test.step` mediante un fixture que adjunta diagnóstico y conserva el error original; no hay una segunda definición en Cucumber. Ejemplo de lectura del reporte:

- Dado que el carrito contiene el producto y los importes esperados.
- Cuando uso Back de Android para volver al detalle y después al catálogo.
- Entonces puedo reabrir el carrito sin perder su contenido.

Los helpers técnicos quedan en Screen Objects y acciones; las aserciones describen nombres, cantidades, importes o estados verificables. Los comentarios de código explican decisiones en español. Las expectativas y los datos sintéticos se fijan antes de comprobar resultados.

## Formato del reporte y evidencias

Cada ejecución conserva su propio directorio: `reports/combined/<runId>` para ambas suites, `reports/api/<runId>` y `reports/mobile/<runId>` para ejecuciones independientes. `latest.json` solo apunta al intento más reciente de cada modalidad; no se borran intentos anteriores.

| Salida | Qué permite revisar |
| --- | --- |
| `html/index.html` | Proyecto, caso, etiquetas, duración, pasos, aserciones y adjuntos |
| `results.json` / `junit.xml` | Consumo estructurado y publicación en CI |
| `execution-summary.json` | Resultado de cada caso, ruta de pasos fallidos, error original y referencias a evidencia |
| Evidencia API | Método, ruta, datos sintéticos, estado, respuesta y duración por paso; sin cabeceras de autenticación ni llamada `/auth` |
| Evidencia Android | Perfil, sesión, servidor Appium, captura y árbol UI del paso fallido, además de evidencia final y buffer de cierres |

Una aserción fallida conserva su diferencia esperado/obtenido y su stack. Los errores de captura se registran aparte sin sustituir la causa del fallo. Las duraciones HTTP son diagnóstico, no una campaña de rendimiento. Los reportes contienen datos de pruebas y permanecen fuera de Git. Logs Appium: `artifacts/android-local`.

## Varios emuladores y CI

`config/mobile/devices.json` define primary (emulator-5554, systemPort 8200, MJPEG 9100) y secondary (emulator-5556, 8201, 9101). Solo primary está creado y verificado. Cada proyecto tiene un worker y sesiones independientes; un servidor Appium compartido escucha en localhost:4723.

Con ambos AVD ya creados y arrancados:

```powershell
$env:MOBILE_DEVICES="android-local-primary,android-local-secondary"
npm.cmd run test:all:regression
Remove-Item Env:MOBILE_DEVICES
```

El segundo perfil aún no acredita paralelismo real. Los nombres, UDID y puertos internos duplicados se rechazan antes de crear sesiones. No aumentar workers sobre un mismo dispositivo.

El [workflow manual](.github/workflows/mobile.yml) permite target all/mobile y smoke/regression/catalog/exploratory en una matriz Android API 30/33, con subida de reportes y logs incluso ante fallos. Para target all, configurar BOOKER_USERNAME y BOOKER_PASSWORD en GitHub Secrets. No se ha ejecutado la matriz en GitHub; verificar minutos disponibles antes de lanzarla.

## Documentación y estado comprobado

- [Alcance, cobertura y siguientes riesgos](docs/alcance-y-estrategia.md).
- [Arquitectura, versiones y decisiones](docs/arquitectura.md).
- [Ejecuciones, hallazgos y pendientes](docs/resultados.md): fuente de los resultados por runId, incluidos intentos fallidos.

Inspector 2026.9.2 está en `C:\dev\.tools\appium-inspector-2026.9.2`, con acceso directo y [capabilities locales](config/mobile/inspector.android-local.json). Finalizar su sesión antes de probar el mismo dispositivo.

iOS, AWS personal, BrowserStack, visual Archify actualizada y revisión humana siguen pendientes. No se accede a la cuenta del banco. Las [instrucciones móviles del agente](.agents/skills/mobile-native-tests/SKILL.md) quedaron en el commit 4d786db antes del primer código nativo. El modelo exacto y el tiempo humano no se inventan.

## Estructura y productos reproducibles

models contiene datos; contracts, interfaces de comportamiento; screens, una pantalla por archivo; components, cabecera y modal compartidos. El patrón es Screen Objects con acciones inyectadas. Los specs se separan por funcionalidad.

Con el emulador listo y el puerto Appium libre:

```powershell
npm.cmd run test:all:catalog
$env:MOBILE_DATA_SEED="felipe-20261110"
$env:MOBILE_SAMPLE_SIZE="3"
npm.cmd run test:all:random
npm.cmd run report:all
Remove-Item Env:MOBILE_DATA_SEED
Remove-Item Env:MOBILE_SAMPLE_SIZE
```

catalog ejecuta los 24 productos. random elige productos reales sin reemplazo y cantidades 1..3; no descarta los que fallan. La misma semilla/tamaño reproduce la selección. Sin semilla explícita se registra el runId. Ambos comandos seleccionan Android dentro del reporte conjunto; para incluir API y toda la cobertura determinista usar test:all:regression.

test:mobile:catalog y test:mobile:random necesitan Appium iniciado manualmente. Los reportes adjuntan semilla y expectativas. La reseña confirma UI, no persistencia remota; las imágenes de color se adjuntan sin inventar un requisito visual.

## Diagnóstico Android local

Con el emulador listo y Appium cerrado: npm.cmd run perf:android. Requiere QA_API33 a 1080x1920; recoge arranque, scroll, eliminación, memoria y cierre. Abrir el informe con npm.cmd run report:performance y la URL local impresa. No usa Web Vitals; límites y resultados están en los tres documentos. El diagnóstico deja el catálogo restaurado.
