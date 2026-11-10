# Arquitectura y decisiones vigentes

Se conserva TypeScript en un repositorio. La elección reduce duplicación de configuración y convenciones; no reduce por sí misma el coste del emulador.

## Cliente, servidor y dispositivo

| Componente | Responsabilidad y ubicación |
| --- | --- |
| Playwright Test | Ejecutar escenarios, steps, aserciones y reportes; no crea un navegador para móvil |
| Fixture nativo | Crear y cerrar cada sesión, adjuntar evidencia; tests/mobile/fixtures/native.fixture.ts |
| WebdriverIO | Cliente W3C WebDriver que envía peticiones HTTP a Appium mediante remote |
| Appium | Servidor independiente iniciado por scripts/mobile/appium.mjs; escucha solo en 127.0.0.1 |
| UiAutomator2 | Driver cargado por Appium para controlar la APK en Android |
| Inspector | Cliente gráfico alternativo del mismo servidor; no se usa al mismo tiempo que la suite sobre un UDID |

El fixture no importa el servidor Appium porque no lo ejecuta dentro de cada prueba. Sus capabilities appium:automationName, udid, appPackage y appActivity seleccionan la automatización nativa. La creación de sesión es POST /session; las acciones pasan por ese servidor y el driver. El reporte adjunta /status, versión real y session ID.

## Organización y principios

- src/mobile/contracts: interfaces pequeñas de catálogo, detalle, carrito y cabecera.
- src/mobile/screens/android: Screen Objects con localizadores observados en la app.
- src/mobile/actions: acciones de negocio que reciben contratos por constructor.
- src/mobile/support: selectores nativos y conversión de importes a centavos.
- config/mobile: capabilities, ejecutor e importación de configuración de Inspector.
- tests/mobile: datos previos, fixture y escenarios.
- scripts/mobile: servidor, readiness, ejecución, reporte y orquestación CI.
- src/api y tests/api: cliente, modelos, fixtures y los ocho escenarios en bookings.spec.ts.

Hay separación concreta de responsabilidades, contratos pequeños e inyección de dependencias. No se afirma una Clean Architecture completa. No hay una BaseScreen que mezcle negocio, sesión y evidencia. Los comentarios explican decisiones en español; los tests conservan steps de negocio.

La revisión corrigió el scroll al volver a un título fuera de pantalla, el control de cantidad mediante clickGesture por ID de elemento, la preparación ante paneles del sistema y la espera /status. Se conservaron aserciones de nombre, cantidad, precio y total.

## Versiones comprobadas

| Componente | Versión |
| --- | --- |
| Node / npm del PC | 22.18.0 / 10.9.3 |
| Playwright Test / TypeScript | 1.65.0 / 5.9.3 |
| WebdriverIO | 9.20.0 |
| Appium / driver UiAutomator2 | 3.9.0 / 6.0.0 |
| Servidor UiAutomator2 en Android | 9.0.1 |
| Android / API / imagen | 13 / 33 / AOSP x86_64 revisión 2 |
| Emulator / Build Tools | 37.2.13.0 / 35.0.0 |
| Java local / Inspector | JBR 25.0.3 / 2026.9.2 |

Appium y el driver se gestionan en package.json y package-lock.json. No se carga APPIUM_HOME del usuario: Appium detecta las dependencias del proyecto, conforme a su [gestión mediante npm](https://appium.io/docs/en/latest/guides/managing-exts/). No hace falta instalar ni enlazar otro driver global. La versión más reciente de UiAutomator2 exigía otro Node y Appium preliminar; no se adoptó.

Java, SDK y rutas pueden configurarse por variables del proceso. La instalación local está separada en C:\dev\.tools; los scripts no modifican herramientas globales ni cuentas del banco. La imagen, APK e Inspector se verificaron contra los hashes publicados.

## DevOps, matriz y paralelismo

Un solo dispositivo utiliza un worker. Aumentar workers sobre emulator-5554 generaría interferencia de estado. Para dos emuladores en un mismo host, usar UDID/puerto de emulador y systemPort distintos. Esta implementación comparte un servidor Appium entre sesiones; si se optara por dos servidores, sus puertos Appium también deberían ser distintos.

El workflow manual .github/workflows/mobile.yml define jobs aislados en Ubuntu para API 30 y 33, max-parallel=2 y fail-fast=false. Cada job instala versiones, prepara su emulador y ejecuta el target all o mobile mediante test:mobile:ci. El target all necesita los secrets BOOKER_USERNAME y BOOKER_PASSWORD; el orquestador selecciona la configuración conjunta. Los puertos pueden coincidir entre jobs porque no comparten máquina. Siempre se suben logs y reportes. No hay ejecución de esa matriz en GitHub todavía; validar minutos disponibles antes de lanzarla.

test:mobile:ci inicia su propio Appium, espera /status, ejecuta la selección y conserva el código de salida. Finalmente cierra únicamente los procesos que creó. El cierre contempla el árbol de procesos en Windows y señales en Linux. El comando manual test:mobile también espera readiness y falla claramente si no encuentra servidor.

## Nube, iOS y visual

Los perfiles de AWS y BrowserStack aún no se presentan como implementados ni verificados. BrowserStack rechazó el APK con 422 antes de crear sesión. La promoción de AWS requiere autenticar exclusivamente la cuenta personal de Felipe y consultar su cuota. iOS requiere un instalador compatible y acceso a infraestructura Apple; no hay Mac ni iPhone disponibles.

La visual Archify existente es histórica: .archify/architecture-mobile-api-20261110-132500/arquitectura.html. Pasó controles de estructura, pero browser-check quedó bloqueado por el proceso elevado. Debe actualizarse y verificarse para esta implementación; no se afirma que describa ya el estado final.

## Fixture parametrizado por dispositivo

El fixture recibe deviceProfile como opción de Playwright Test. Cada proyecto inyecta un perfil del archivo devices.json; no se calcula el dispositivo a partir de workerIndex. Este índice puede cambiar tras un fallo y solo se conserva como evidencia.

La configuración admite tantos workers globales como perfiles seleccionados, con un límite workers=1 dentro de cada proyecto. Esto permite concurrencia entre emuladores y evita concurrencia de tests sobre el mismo UDID incluso si se incorporan más archivos de escenarios. Cada test conserva una sesión nueva, limpieza y cierre independientes.

| Perfil | UDID | systemPort | mjpegServerPort | Estado físico |
| --- | --- | --- | --- | --- |
| android-local-primary | emulator-5554 | 8200 | 9100 | Verificado |
| android-local-secondary | emulator-5556 | 8201 | 9101 | Configurado; AVD pendiente |

Se comparte Appium en el puerto 4723; no es obligatorio levantar un servidor por emulador. El puerto ADB del host también puede compartirse porque cada comando identifica su UDID. Se rechazan nombres repetidos, UDID duplicados y colisiones de puertos internos antes de crear sesiones. Los puertos MJPEG quedan separados para evitar conflictos si se incorporan streams; esto no significa que ya haya video implementado.

Los proyectos incluyen su nombre en la evidencia generada por Playwright. El fixture adjunta el perfil, el nombre de proyecto, las capabilities resueltas y el session ID. El segundo AVD deberá crearse y arrancarse antes de una ejecución paralela real. [Guía UiAutomator2](https://appium.github.io/appium-uiautomator2-driver/latest/guides/parallel-tests/) y [límite por proyecto](https://playwright.dev/docs/api/class-testproject#test-project-workers).


## Pasos observables y ejecución conjunta

tests/support/observed-step.ts proporciona un step tipado, con box=true para señalar la llamada del escenario. Conserva el error de la aserción y captura evidencia también cuando se agregan errores suaves. Los fallos de captura se registran sin reemplazar la causa original.

El fixture API registra método, ruta, datos sintéticos, respuesta, estado y duración. Cada paso adjunta sus intercambios y el fixture adjunta el historial final, incluida limpieza. No registra cabeceras, cookies ni la petición /auth; la respuesta se limita a 12000 caracteres. El fixture Android adjunta captura, árbol UI y contexto de sesión al paso fallido, además de la evidencia final. No se usa trace de navegador para representar acciones Appium.

config/combined/playwright.config.ts crea un proyecto API y los proyectos Android seleccionados. API tiene un worker; cada dispositivo tiene uno. Así pueden correr API y Android al mismo tiempo, sin compartir el estado de un emulador entre tests. Se usan las mismas fuentes de escenarios y fixtures; no se duplican suites para el reporte.

scripts/quality/ci.mjs reutiliza la orquestación Appium existente. scripts/quality/run.mjs ejecuta una sola invocación Playwright con reporteros HTML/JSON/JUnit y directorio propio por runId. No se fusionan reportes HTML independientes ni se sobrescriben evidencias anteriores. summarize.mjs agrega execution-summary.json con proyecto, etiquetas, estado, errores y rutas de pasos fallidos. Los runners independientes generan la misma estructura de resumen.

Los controles nativos se exponen dentro del viewport antes de pulsar. NativeUi.tap espera varias muestras consecutivas de posición y tamaño estables y usa clickGesture por ID de elemento. No introduce pausas fijas ni reintentos del test; las esperas siguen exigiendo la cantidad exacta. Los errores de sincronización se clasifican por separado de los cierres conocidos de la app.

## Revisión de responsabilidades y patrón

La solución usa Screen Objects y acciones de negocio inyectadas. No implementa Actor/Tasks/Interactions/Questions de Screenplay. Los archivos anteriores contenían varias clases/interfaces; se retiraron shop.screens.ts y shop.contracts.ts para mantener una responsabilidad por archivo.

| Carpeta | Responsabilidad | Ejemplos |
| --- | --- | --- |
| src/mobile/models | Datos sin operaciones UI | product.ts, product-case.ts, cart-snapshot.ts, authentication-state.ts |
| src/mobile/contracts | Interfaces de comportamiento | catalog.contract.ts, product-detail.contract.ts, cart.contract.ts, login.contract.ts |
| src/mobile/screens/android | Una implementación por pantalla | catalog, product-detail, cart, login |
| src/mobile/components/android | Cabecera y modal compartidos | header.component.ts, review-dialog.component.ts |
| src/mobile/actions | Coordinación por interfaces inyectadas | shopping.actions.ts |
| tests/mobile/data | Referencia y generación reproducible | catalog-products.ts, product-case.factory.ts, cart-cases.ts |
| tests/mobile/specs | Escenarios por funcionalidad | cart, cart-interactions, catalog, generated-cart, login, navigation, review |

contracts es una decisión del proyecto, no una obligación de Playwright o WebdriverIO. TypeScript admite interfaces para datos y comportamiento; las carpetas distinguen su intención. El fixture compone implementaciones y expone interfaces. Se eliminaron todos los .gitkeep, incluido iOS: una carpeta vacía no demuestra soporte implementado.

WebdriverIO sigue siendo el cliente WebDriver, Appium el servidor y UiAutomator2 el driver Android. Playwright Test ejecuta, verifica y reporta. No hay servidor Appium dentro de un Screen Object.

## Productos y reproducción por semilla

Los 24 productos y precios se fijan desde BaseActivity de la versión 2.3.0, commit 3e514167ec715abf6ab93e148ef6f97b86752c05 del repositorio público de la demo. El esperado no se copia de la respuesta del carrito. productCase calcula total a partir de precio de referencia y cantidad.

syntheticProductCases deriva un PRNG desde SHA-256 de la semilla y mezcla el catálogo sin reemplazo. MOBILE_DATA_SEED se registra y se hereda en los workers; MOBILE_SAMPLE_SIZE admite 1..24 (predeterminado 3). Se generan cantidades 1..3 y no se excluyen productos que fallan. Los límites de seguridad de los helpers no se presentan como límites del negocio.

CAT-01 cubre todos los productos de forma determinista. GEN-01 explora compras con @random, fuera de @regression. Smoke conserva dos datos fijos de carrito. La búsqueda del catálogo permite hasta 16 desplazamientos, con límite y comprobación de paquete activo.

## Colores y reseñas

Las muestras usan takeElementScreenshot del protocolo WebDriver. takeScreenshot resolvía una captura completa y produjo una comparación de regiones incorrectas en el primer intento; ese fallo de automatización se conserva y no se clasifica como defecto de la app. PNGJS decodifica el centro del elemento para comparar la variante elegida antes de agregar con el indicador del carrito; no compara PNG comprimido ni fotografía completa.

La imagen anterior/posterior se adjunta aparte. No se exige que cambie sin un criterio visual confirmado. El indicador del carrito se caracteriza como solo lectura conforme a CartItemAdapter de 2.3.0.

ReviewDialog tiene contrato y componente propios. Los casos de 1/5 estrellas comprueban confirmación UI, cierre del modal y regreso al producto sin alterar el carrito. No demuestran almacenamiento ni envío a un backend.

La matriz manual dispone de 40 minutos por job para incluir instalación, arranque y regresión ampliada; smoke sigue siendo la selección predeterminada. El descubrimiento de regresión con ambos perfiles produjo 86 combinaciones (8 API + 39 por dispositivo), sin ejecutar el segundo emulador. No se ha consumido ejecución en GitHub.

El workflow manual expone seed y sample_size. La semilla predeterminada assessment-2.3.0 se comparte entre jobs para comparar la misma selección; sample_size predeterminado 3. En local, si no se especifica semilla, el runner registra el runId.
