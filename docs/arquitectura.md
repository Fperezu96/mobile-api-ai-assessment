# Arquitectura de negocio y de automatización

**Autor:** Felipe Pérez Upegui · **Revisión:** 10 de noviembre de 2026.

## 1. ¿Qué negocio representa cada producto?

**Respuesta.** La APK representa una tienda de demostración; Restful Booker representa un servicio independiente de reservas. No se dibuja una conexión entre la APK y Booker ni se presupone una compra real o un sistema de pagos productivo.

### 1.1 Modelo funcional de la APK

| ID | Capacidad y condición de negocio | Evidencia y cobertura |
| --- | --- | --- |
| BIZ-01 | Entrar al catálogo como invitado, recorrer productos y consultar detalle | Observado en Android; MOB-07 y CAT-01. Login no bloquea la exploración |
| BIZ-02 | Seleccionar producto, cantidad y variante; agregar al carrito | MOB-01, DETAIL-01 y COLOR-01 sobre Backpack y variantes comprobadas |
| BIZ-03 | Revisar el carrito, modificar unidades, eliminar y volver sin perder estado | CART-01/02, MOB-03/04; un producto por escenario automatizado |
| BIZ-04 | Elegir estrellas, recibir confirmación y continuar desde el detalle | REVIEW-01, 1/5 estrellas. No demuestra almacenamiento de reseñas |
| BIZ-05 | Solicitar checkout: si existe sesión, continuar; sin sesión, presentar login | Rama identificada en CartFragment de la fuente 2.3.0; checkout E2E no ejecutado |
| BIZ-06 | Tras login desde checkout, continuar con datos de entrega; login desde menú retorna a catálogo | Rama identificada en LoginFragment; no se declara checkout aprobado |
| BIZ-07 | Completar entrega, pago, revisión y confirmación de pedido en la demo | Capacidad pendiente de exploración/automatización; no se ha enviado una compra real ni se afirma persistencia remota |
| BIZ-08 | Acumular varios productos/variantes en un pedido | Capacidad de la app y riesgo pendiente. Los tests actuales no acreditan un pedido multiproducto |

**Fuente de referencia:** repositorio público [My Demo App Android, revisión 3e514167](https://github.com/saucelabs/my-demo-app-android/tree/3e514167ec715abf6ab93e148ef6f97b86752c05). En particular [CartFragment](https://github.com/saucelabs/my-demo-app-android/blob/3e514167ec715abf6ab93e148ef6f97b86752c05/app/src/main/java/com/saucelabs/mydemoapp/android/view/fragments/CartFragment.java) y [LoginFragment](https://github.com/saucelabs/my-demo-app-android/blob/3e514167ec715abf6ab93e148ef6f97b86752c05/app/src/main/java/com/saucelabs/mydemoapp/android/view/fragments/LoginFragment.java). La lectura de una rama no sustituye su ejecución.

**Visual de negocio:** [modelo explorable generado con Archify](../.archify/workflow-negocio-20261110-173325/modelo-negocio.html). Distingue exploración, carrito, sesión y checkout; la ruta de reservas aparece como producto separado. Los pasos de checkout están señalados como no ejecutados.

### 1.2 Modelo funcional de reservas

Un consumidor crea una reserva, conserva su identificador, consulta/busca el registro y puede modificarlo o eliminarlo con autorización. Se verifica el rechazo de datos incompletos y de cambios no autorizados. Los ocho escenarios usan su propia preparación/limpieza; el diagrama de capacidades no implica dependencia de orden entre tests.

## 2. ¿Por qué un repositorio si son dos proyectos independientes?

**Respuesta.** Se comparte la infraestructura de desarrollo y reporte; se separan dominio, clientes, fixtures, configuración, datos y escenarios.

| Aspecto | Proyecto API | Proyecto APK |
| --- | --- | --- |
| Dominio | Reservas | Tienda, carrito y sesión |
| Fuente | src/api | src/mobile |
| Escenarios y datos | tests/api | tests/mobile |
| Configuración | config/api/playwright.config.ts | config/mobile/playwright.config.ts |
| Preparación | Token de práctica y reservas sintéticas | APK, emulador, capabilities y sesión nativa |
| Ejecución independiente | test:api | test:mobile:ci |
| Evidencia | reports/api | reports/mobile |

config/combined/playwright.config.ts agrega resultados de ambos como proyectos Playwright distintos. Ningún test móvil llama al cliente Booker. Una ejecución conjunta no convierte los dos productos en una integración.

## 3. ¿Qué hace cada herramienta?

| Componente | Responsabilidad real | Ejemplo |
| --- | --- | --- |
| Playwright Test | Descubrir tests, seleccionar tags, fixtures, aserciones, steps y reportes | config/combined y tests/support/observed-step.ts |
| Playwright APIRequestContext | Cliente HTTP del proyecto de reservas | src/api/clients/booking.client.ts |
| WebdriverIO | Cliente W3C WebDriver para solicitar sesiones/acciones nativas | remote en tests/mobile/fixtures/native.fixture.ts |
| Appium | Servidor independiente en localhost:4723; recibe POST /session y comandos | scripts/mobile/appium.mjs |
| UiAutomator2 | Driver Android cargado por Appium para operar la APK | appium:automationName en capabilities |
| Inspector | Cliente gráfico alternativo para inspeccionar UI | No se comparte UDID con un test activo |
| ADB/gfxinfo | Diagnóstico nativo de proceso, frames, memoria y logs | scripts/mobile/performance.mjs; sin Appium concurrente |

Playwright no abre un navegador para controlar la APK. Un contexto web no sustituye una sesión nativa.

### Flujo local de una prueba nativa

1. npm ci instala Appium, WebdriverIO y appium-uiautomator2-driver en el proyecto. El driver carga su servidor Android auxiliar cuando crea una sesión; no se instalan capas de negocio dentro de Appium.
2. El emulador o dispositivo físico arranca fuera de WebdriverIO. ADB confirma su UDID; el SDK y Java permiten al driver comunicarse con Android.
3. appium:start inicia un servidor HTTP local en 127.0.0.1:4723. Playwright Test descubre el spec y ejecuta native.fixture.ts.
4. El fixture comprueba /status, construye capabilities y llama remote de WebdriverIO para solicitar una sesión W3C. Appium selecciona UiAutomator2 por automationName y el dispositivo por UDID.
5. UiAutomator2 prepara su instrumentación en Android e instala/inicia la APK indicada por appium:app. El fixture compone pantallas/componentes y acciones para el escenario.
6. El spec llama acciones/pantallas; estas usan el cliente WebdriverIO para enviar comandos HTTP W3C a Appium. El driver los traduce a operaciones nativas sobre la APK. La respuesta vuelve por el mismo recorrido y Playwright comprueba el resultado.
7. El fixture recoge evidencia y ejecuta deleteSession; el launcher gestionado también detiene su Appium. El servidor manual se cierra con Ctrl+C. El emulador tiene un ciclo de vida independiente.

El flujo no va de Appium hacia WebdriverIO para interpretar acciones: WebdriverIO es quien solicita y recibe respuestas. El emulador es Android Emulator; UiAutomator2 es el driver y Playwright Test es el runner.

**Visual técnico:** [cliente, servidor y dispositivo](../.archify/architecture-ejecucion-nativa-20261110-190000/ejecucion-nativa.html). El gráfico describe el camino local implementado; BrowserStack/iOS quedan fuera de ese flujo.

Referencias: [Appium y driver Android](https://appium.io/docs/en/latest/quickstart/uiauto2-driver/), [cliente WebdriverIO](https://webdriver.io/docs/api/modules/#remoteoptions-modifier).

## 4. ¿Cómo se separan responsabilidades y se aplican SOLID?

| Capa | Responsabilidad | Ejemplo |
| --- | --- | --- |
| models | Datos sin operaciones de UI | Product, ProductCase, CartSnapshot y AuthenticationState |
| contracts | Interfaces de comportamiento por responsabilidad | Catalog, ProductDetail, Cart, Login, Header y ReviewDialog |
| screens/android | Localizadores e interacción de una pantalla | catalog, product-detail, cart y login |
| components/android | Controles compartidos y modal | HeaderComponent y ReviewDialogComponent |
| actions | Coordinar un flujo mediante interfaces inyectadas | ShoppingActions recibe Catalog, ProductDetail y Header |
| fixtures/session | Componer dependencias, abrir/cerrar sesión y conservar evidencia | native.fixture.ts |
| specs/data | Describir comportamientos y fijar expectativas | Specs por funcionalidad y fábrica por semilla |

**S:** pantalla, datos, sesión y reporte tienen responsabilidades distintas. **I:** las acciones consumen contratos pequeños; no existe una interfaz universal con todas las operaciones. **D:** ShoppingActions depende de interfaces y recibe implementaciones por constructor. **O:** una nueva implementación de plataforma puede satisfacer el contrato sin reescribir la acción. **L:** esa sustitución requiere cumplir las mismas pre/postcondiciones y validarse en el dispositivo; no queda demostrada por compilar.

El patrón implementado es Screen Objects con acciones inyectadas. No se afirma una implementación completa de Screenplay o Clean Architecture. contracts es una convención del proyecto, no un requisito de Playwright; los modelos son datos y los contratos son capacidades.

## 5. ¿Cómo compartir Android e iOS sin duplicar toda la automatización?

**Respuesta de diseño.** Compartir primero las reglas y recorridos; adaptar la interacción de plataforma solo donde difiera. Android/iOS son variantes de infraestructura UI, no dos dominios de negocio independientes.

| Situación comprobada | Diseño sugerido | Qué se comparte |
| --- | --- | --- |
| Misma estructura y operaciones; solo cambian selectores | Un Screen Object común recibe un mapa de localizadores validado por plataforma | Comportamiento de pantalla, acciones, datos y escenarios |
| Misma regla, pero jerarquía/navegación diferentes | Dos implementaciones del mismo contrato, elegidas por una fábrica al crear la sesión | Contratos, modelos, acciones y aserciones de negocio |
| Gestos, teclado, permisos o Back específicos | Un adaptador de interacciones nativas por plataforma | Intención del escenario y comprobación del estado resultante |
| Diferencia funcional confirmada por producto | Escenarios/variantes explícitos por capacidad | Solo las expectativas que realmente sean equivalentes |

La composición se decide una vez en el fixture según la plataforma/capabilities. Evitar condicionales Android/iOS repartidos por cada test y evitar una BaseScreen con todas las responsabilidades. Extraer código común después de verificar equivalencia; no por parecido visual.

En React Native puede existir código compartido y aun así diferir el árbol de accesibilidad, agrupación de vistas, teclado o navegación. Establecer identificadores de prueba estables con desarrollo, revisar su exposición real en Inspector y no sustituir etiquetas accesibles para usuarios por identificadores técnicos. Referencias oficiales: [código específico por plataforma](https://reactnative.dev/docs/platform-specific-code) y [accesibilidad](https://reactnative.dev/docs/accessibility).

**Estado actual:** implementaciones Android verificadas. No hay adaptadores iOS, fábrica multiplataforma ni Screen Object común demostrado contra ambos sistemas. Esta APK de referencia es Android nativo; no se presupone React Native ni equivalencia con la app iOS de Sauce Labs.

## 6. ¿Qué versiones se eligieron y por qué?

| Componente | Versión observada/fijada | Decisión y límite |
| --- | --- | --- |
| Node / npm | 22.18.0 / 10.9.3 | Usar el entorno existente y un lockfile reproducible; no cambiar herramientas globales |
| Playwright Test | 1.65.0 | APIRequestContext, fixtures, steps y reporteros comunes con suites independientes |
| TypeScript | 5.9.3 | NodeNext, modo estricto y comprobación de imports/parámetros sin uso |
| WebdriverIO | 9.20.0 | Cliente remote para Appium; no añadir un segundo runner móvil |
| Appium | 3.9.0 | Servidor local fijado y compatible con el Node del PC |
| UiAutomator2 | 6.0.0 | Mantener compatibilidad comprobada; la alternativa más reciente revisada exigía otro Node/Appium preliminar |
| Servidor UiAutomator2 Android | 9.0.1 | Dependencia del driver; no se instala como una herramienta global adicional |
| Android | 13 / API 33, AOSP x86_64 rev. 2 | AVD QA_API33 reproducido localmente; no acredita otras versiones |
| Emulator / Build Tools | 37.2.13.0 / 35.0.0 | Build Tools aporta apksigner.jar requerido en la conexión real |
| Java | JBR 25.0.3 local | Entorno comprobado en este PC; no se entrega una matriz remota |
| Inspector | 2026.9.2 | Inspección de resource-id/accessibility id reales |
| PNGJS / tipos | 7.0.0 / 6.0.5 | Comparar píxeles de recortes de elementos, no PNG comprimido ni pantalla completa |

Appium y el driver están en package.json/lockfile. El launcher retira APPIUM_HOME del proceso hijo para cargar el driver del proyecto por npm; no duplica una instalación global. El SDK local está en C:\dev\.tools\android-sdk.

La APK es [My Demo App 2.3.0 build 27](https://github.com/saucelabs/my-demo-app-android/releases/download/2.3.0/mda-2.3.0-27.apk). El manifiesto apps/android-manifest.json fija URL y SHA256; capabilities comprueba el hash antes de crear la sesión. Es una build debug: no se presenta como artefacto release.

## 7. ¿Cómo se ejecuta en paralelo localmente?

Un proyecto API tiene un worker; cada proyecto de dispositivo tiene un worker y sesión nueva por test. Los perfiles se seleccionan por nombre y no por workerIndex. Se rechazan UDID o puertos internos duplicados.

| Perfil local | UDID | systemPort / MJPEG | Estado |
| --- | --- | --- | --- |
| android-local-primary | emulator-5554 | 8200 / 9100 | Ejecutado |
| android-local-secondary | emulator-5556 | 8201 / 9101 | Configurado; AVD sin crear/ejecutar |

Un Appium compartido admite sesiones independientes; no se incrementan workers sobre el mismo UDID. El descubrimiento con dos perfiles produjo 86 combinaciones de regresión; no demuestra paralelismo real.

El workflow de GitHub Actions se retiró por decisión de alcance: esta entrega se verifica localmente. La ausencia de BrowserStack no impide técnicamente un pipeline con emulador, pero tampoco se implementa ni se acredita esa alternativa en la entrega actual. Una futura ejecución cloud y su paralelismo se explican en resultados.

Los runners esperan /status, conservan el código de salida y cierran solo sus procesos. Smoke mantiene señal rápida; catálogo completo y exploración tienen coste diferente. Compartir repositorio no elimina el consumo del emulador/Appium.

## 8. ¿Cómo se reporta y se diagnostica un fallo?

API registra método/ruta, datos sintéticos, estado/respuesta y duración por step, sin cabeceras de autenticación ni llamada /auth. La limpieza verifica propiedad del registro.

Android adjunta perfil, capabilities, versión, session ID, captura y árbol UI del paso fallido, además del estado final y logs. El wrapper de step conserva la aserción original y sus diferencias; los errores de captura no sustituyen el fallo.

Cada ejecución tiene HTML, JSON, JUnit y execution-summary.json con ruta del paso fallido. No se mezclan intentos para aparentar que la regresión completa pasó tras una comprobación focalizada. Los datos sintéticos tienen semilla y expectativas fijadas antes de interactuar.

El diagnóstico de rendimiento usa datos nativos y un reporte propio. TTID inicial, muestras de frames y tiempos ADB tienen límites distintos, explicados en [alcance](alcance-y-estrategia.md) y [resultados](resultados.md).

## 9. ¿Qué falta para iOS y BrowserStack?

Instalador iOS compatible, proveedor/permisos/cuota, localizadores observados, driver XCUITest y sesiones reales. No basta con cambiar platformName o reutilizar IDs Android. Primero validar un smoke de equivalencia y luego decidir qué implementación compartir.

BrowserStack autenticó, pero rechazó la carga Android con 422 antes de crear sesión; no se ha confirmado la causa particular. Su valor sería acceso a dispositivos reales/iOS y evidencia de sesiones; se evaluará después de la revisión final, sin compra ni consumo adicional ahora. AWS personal y cuota gratuita siguen sin verificar; no se toca la cuenta del banco.


### Verificación del diagrama de negocio

Archify aprobó la validación del modelo, la generación y la comprobación del HTML. Su comprobación integrada en Chrome quedó bloqueada por la conexión de depuración en la sesión elevada de Windows, incluso tras un reintento. Por tanto, no se declara aprobada la finalización completa de Archify. Como comprobación independiente, Chrome con sandbox habilitado renderizó el archivo sin errores JavaScript ni desbordamiento; se revisó visualmente la separación API/APK y la sesión condicional del checkout. El recibo está en `.archify/workflow-negocio-20261110-173325/revision-independiente.json`.
