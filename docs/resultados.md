# Resultados y respuestas al enunciado

**Autor:** Felipe Pérez Upegui · **Revisión:** 10 de noviembre de 2026.

## 1. Producto A: API Restful Booker

**Respuesta.** Ocho de ocho aprobadas en el proyecto API de la ejecución 2026-11-10T21-40-59-483Z.

| Código | Observado | Resultado |
| --- | --- | --- |
| API-01 | POST/GET 200; ID válido y datos completos recuperados | Aprobado |
| API-02 | HTTP 500 sin reserva creada, conforme a la caracterización definida | Aprobado |
| API-03 | Listado y filtro devuelven la reserva propia | Aprobado |
| API-04 | PUT 200 y GET confirman actualización completa | Aprobado |
| API-05 | PATCH 200 cambia preferencias y conserva otros campos | Aprobado |
| API-06 | DELETE 201; detalle 404 y ausencia en búsqueda | Aprobado |
| API-07 | PUT sin autorización 403; estado original conservado | Aprobado |
| API-08 | Dos huéspedes/IDs distintos; búsquedas aisladas | Aprobado |

**Hallazgos de API.** No se demostró incumplimiento del contrato en estos ocho escenarios. Un 500 por campo ausente merece revisión de diseño, pero la documentación no fija un rechazo 400/422.

## 2. Producto B: APK Android

**Respuesta.** La regresión ejecutó 39 combinaciones Android de la selección descrita en alcance. En la ejecución 2026-11-10T21-40-59-483Z: 18 aprobadas y 21 fallidas. Se distinguen los defectos de la app de una espera de automatización corregida posteriormente.

| Grupo | Resultado observado |
| --- | --- |
| MOB-01 D1/D2 | 2 aprobadas: nombre, cantidad, precio y total |
| MOB-02 | Falló: credenciales incorrectas habilitan sesión |
| MOB-03 / MOB-06 / MOB-07 | Back, usuario vacío y scroll aprobados |
| MOB-04 | Timeout inicial de 5 s; aprobó en comprobación focalizada con espera de 10 s, sin cambiar aserciones |
| CAT-01 | 5 de 24 detalles aprobados; 19 cierres confirmados |
| CART-01/02 y DETAIL-01 | 3 aprobadas: recálculo, última unidad y cantidad cero |
| COLOR-01 Blue/Green y COLOR-02 | 3 aprobadas: variante conservada y caracterización del indicador |
| REVIEW-01 con 1/5 estrellas | 2 aprobadas: confirmación y continuidad; sin probar persistencia remota |

En el catálogo abren Backpack base, naranja, roja, violeta y amarilla. La verde y los otros 18 productos reproducen cierres. Los nombres describen reproducciones bajo el orden inicial; la causa depende del índice de la lista.

### Hallazgos y pasos de reproducción

**Entorno común:** My Demo App Android 2.3.0 build 27, Android 13/API 33, emulador QA_API33. Antes de cada reproducción, iniciar con los datos de la app restablecidos y el catálogo en su orden inicial. Restablecer solo la demo; no el dispositivo. Los casos de catálogo y carrito se realizan como invitado.

#### APP-01 · Credenciales incorrectas habilitan una sesión

1. Abrir la app y esperar la pantalla Products.
2. Abrir el menú lateral mediante el icono de la esquina superior izquierda.
3. Seleccionar Log In para abrir el formulario.
4. Ingresar bob@example.com como usuario e incorrecta-qa-2026 como contraseña.
5. Ocultar el teclado si cubre el botón y pulsar Login.
6. Abrir de nuevo el menú lateral y revisar si aparece Log Out.

**Esperado:** rechazo visible de las credenciales y ausencia de una sesión autenticada, según el negativo solicitado en el ejercicio.
**Observado:** retorna al catálogo y aparece Log Out sin mostrar el rechazo esperado.
**Impacto:** incumple el criterio de autenticación del ejercicio. Evidencia: MOB-02, captura/formulario y estado del menú de la ejecución indicada.

#### APP-02 · Backpack verde cierra la app al abrir su detalle

1. Abrir la app como invitado y esperar Products.
2. Mantener el orden inicial del catálogo; no aplicar ordenamiento.
3. Localizar la tarjeta cuyo nombre completo es Sauce Labs Backpack (green), desplazando el catálogo si es necesario.
4. Tocar esa tarjeta para abrir el detalle; no confundirla con el selector de color del detalle de Backpack base.
5. Comprobar si se presenta el nombre/precio del producto y si la aplicación permanece abierta.

**Esperado:** abrir el detalle del producto seleccionado sin terminar la app; expectativa derivada del recorrido de compra.
**Observado:** la app se cierra antes de completar el recorrido. El log del proceso registra NullPointerException en ProductCatalogFragment.java:156, asociado al elemento nulo de la posición 1.
**Impacto:** bloquea la compra desde esa referencia. Evidencia: CAT-01 para Backpack (green), captura/árbol UI y log del PID de ese caso.

#### APP-03 · Productos desde la posición 6 cierran la app al consultar el detalle

1. Restablecer la demo y abrir el catálogo como invitado.
2. Mantener su orden inicial, sin aplicar filtros de ordenamiento.
3. Desplazar el catálogo hasta localizar Sauce Labs Bike Light.
4. Tocar la tarjeta Sauce Labs Bike Light para abrir su detalle.
5. Comprobar si se muestra el producto y si la app continúa abierta.
6. Para delimitar el alcance, repetir desde un estado limpio con las otras referencias fallidas de CAT-01, conservando su nombre en cada evidencia.

**Esperado:** abrir el detalle con el nombre y precio de referencia, sin cerrar la app.
**Observado:** cierre con ArrayIndexOutOfBoundsException, length=6, en ProductCatalogFragment.java:156. El barrido registró 18 reproducciones sobre referencias desde la posición 6.
**Impacto:** bloquea gran parte del catálogo. Se agrupa por causa observada; las 18 reproducciones no se presentan como 18 defectos diferentes. Evidencia: CAT-01, PID/intervalo y adjuntos de cada referencia.

#### OBS-01 · Falta confirmar el comportamiento visual de la fotografía

1. Abrir el catálogo como invitado y seleccionar Sauce Labs Backpack base.
2. En el detalle, elegir el color Blue o Green y observar la fotografía.
3. Mantener una unidad, pulsar Add To Cart y abrir el carrito desde su icono.
4. Comparar el indicador de color, el producto y la fotografía mostrada.

**Observado:** el indicador conserva el color elegido, pero la fotografía continúa negra.
**Clasificación:** observación pendiente de confirmar con producto; el enunciado no exige cambiar la fotografía. La conservación de variante se comprueba en COLOR-01.

#### PERF-01 · Bloqueo de la interfaz al eliminar

1. Abrir Sauce Labs Backpack base desde el catálogo como invitado.
2. Agregar una unidad y abrir el carrito; verificar USD 29,99 y una unidad.
3. Pulsar Remove Item una sola vez.
4. Observar la respuesta de la pantalla hasta que aparezca No Items.

**Observado:** la interfaz queda bloqueada aproximadamente cinco segundos antes de mostrar el estado vacío. El diagnóstico nativo registró un frame de 5017,56 ms.
**Interpretación:** problema focal de respuesta, sin SLO contractual ni afirmación de ANR. MOB-04 aprobó al esperar el estado vacío hasta diez segundos; eso no elimina el bloqueo. Evidencia: reports/performance/2026-11-10T22-30-15-267Z y la comprobación funcional 2026-11-10T21-59-19-091Z.

## 3. ¿Cómo se utilizó IA y qué revisión se hizo?

**Respuesta.** Se creó y conservó .agents/skills/mobile-native-tests/SKILL.md en 4d786db antes de utilizarla. El agente implementó el caso positivo parametrizado y produjo el resultado móvil en 19c7073; las ampliaciones estructurales y de cobertura quedaron en 64f59b6.

Invocación operacional: implementar carrito nativo con Screen Objects, acciones inyectadas, datos/expectativas previas, sesiones independientes y evidencia; ejecutar, revisar fallos y corregir automatización sin debilitar aserciones.

**Herramienta:** Codex en ChatGPT Work. **Modelo exacto:** GPT 6.1 Sol

## 4. ¿Qué otras tres skills se proponen y cuál se construiría primero?

| Propuesta | Propósito y usuario | Entradas → salidas | Verificación y prioridad |
| --- | --- | --- | --- |
| Triage de fallos | Ayudar a QA a separar app, automatización y entorno en cada producto | Reportes/logs/capturas → diagnóstico con fuente, impacto y duda pendiente | Contrastar con reproducción y revisión humana; P1, primera |
| Revisión de matriz | Ayudar a QA/DevOps a elegir plataformas sin duplicar estado o exceder cuota | Compatibilidad, capacidades, cuota → matriz acotada y configuración | Verificar puertos, sesiones y resultados reales por plataforma; P2 |
| Preparación de entrega | Ayudar a QA/lead a mantener respuestas verificables al enunciado | Requisitos, código, resultados → actualización de los tres documentos y evidencia faltante | Cada afirmación debe apuntar a prueba/fuente; P2 |

Se construiría primero triage: ya hay cierres, un login permisivo y problemas de captura/espera que requieren clasificación distinta. Medir tiempo hasta diagnóstico correcto y concordancia con revisión humana antes/después; no inventar una mejora porcentual.

Checksum, detección de puertos, extracción de estadísticas y validación de esquemas se resuelven con scripts deterministas; no necesitan otra skill o una inferencia de IA.

## 5. ¿Cómo se conectaría BrowserStack en una ampliación?

La ampliación a BrowserStack se mantiene independiente del pipeline Android con emulador. No se adquiere capacidad App Automate para esta entrega.

| Ubicación | Ajuste futuro |
| --- | --- |
| .env / secretos del ejecutor | BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY; app_url por plataforma |
| config/mobile | Perfil cloud con dispositivo y versión realmente disponibles |
| src/mobile/session | Crear/cerrar remote; separar local/cloud sin filtrar credenciales en adjuntos |
| tests/mobile/fixtures/native.fixture.ts | Inyectar sesión y pantallas; reemplazar diagnóstico ADB local en cloud |
| config/mobile/playwright.config.ts | Un proyecto por perfil, un worker por dispositivo y límite total según cuota |

Variables del ejemplo .env.example: BROWSERSTACK_ANDROID_APP y BROWSERSTACK_IOS_APP contendrían bs://… tras una carga válida. No se usa un “client ID”: App Automate autentica con username/access key. Mantenerlos fuera de Git y de logs. La clave no debe adjuntarse dentro de capabilities ni de resúmenes.

~~~typescrip
// Esquema de conexión futura: no es una opción activa del fixture actual.
const session = await remote({
  protocol: 'https', hostname: 'hub-cloud.browserstack.com', port: 443, path: '/wd/hub',
  user: process.env.BROWSERSTACK_USERNAME, key: process.env.BROWSERSTACK_ACCESS_KEY,
  logLevel: 'silent', connectionRetryCount: 0,
  capabilities: {
    platformName: 'Android', 'appium:automationName': 'UiAutomator2',
    'appium:deviceName': device.name, 'appium:platformVersion': device.osVersion,
    'appium:app': process.env.BROWSERSTACK_ANDROID_APP,
    'bstack:options': { projectName: 'Mobile API AI Assessment', buildName: runId, sessionName: testId },
  },
});
// Recoger evidencia y cerrar siempre mediante try/finally + deleteSession.
~~~

BrowserStack administra servidor Appium y dispositivos remotos; no arrancar appium:start para ese endpoint ni enviar UDID/systemPort de emuladores locales. Para iOS hacen falta un instalador compatible y firmado, XCUITest y adaptadores/locators observados; una APK no se ejecuta en iOS.

**Paralelismo propuesto.** Cada proyecto crea su sesión y datos aislados. El máximo concurrente debe respetar los paralelos disponibles del plan; multiplicar jobs de una matriz por workers puede excederlo. Limitar ambos niveles, cerrar sesiones aun al fallar y recuperar session ID, URL, capturas y logs sanitizados. El perfil local secundario tampoco se considera ejecutado por estar en JSON.\n