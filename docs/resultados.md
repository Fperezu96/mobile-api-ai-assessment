# Resultados y respuestas al enunciado

**Autor:** Felipe Pérez Upegui · **Revisión:** 10 de noviembre de 2026.

## 1. ¿Qué mínimos se implementaron y qué evidencia los respalda?

**Respuesta.** Se implementaron y ejecutaron ambos proyectos. La ejecución revela defectos de la demo; implementar un negativo no significa que el producto lo haya aprobado.

| Requisito del enunciado | Respuesta y ejemplo | Evidencia/estado |
| --- | --- | --- |
| App instalada Android nativa/híbrida | APK My Demo App 2.3.0 build 27 en QA_API33, Android 13 | Sesiones Appium/UiAutomator2, manifest con SHA256 y capturas; Android ejecutado |
| Móvil exitoso, dos datos previos | MOB-01 D1/D2: Backpack con 1/2 unidades, USD 29,99/59,98 | Ambos aprobados; cart.spec.ts |
| Móvil negativo | MOB-02 exige rechazo y ausencia de sesión | Ejecutado y fallido: login permisivo. MOB-06 con usuario vacío aprobó |
| Interacción nativa | MOB-03 Back y MOB-07 scroll con estado posterior | Ambos aprobados; navigation.spec.ts |
| API exitosa/negativa | API-01 crear/consultar; API-02 omitir firstname | Ambos aprobados según su oráculo; el 500 es caracterización, no estado documentado |
| Otros tres escenarios priorizados | CART-01, DETAIL-01 y COLOR-01, con riesgo/impacto | Documentados y automatizados; ver sección 4.2 de alcance |
| Page/Screen Objects y clientes separados | Pantallas/contratos/modelos y BookingClient | Código revisado; arquitectura separada por producto |
| Skill previa y agente | Instrucciones en 4d786db, antes del resultado móvil 19c7073 | Invocación y correcciones conservadas; sección 7 |
| Comandos, reportes y fallos reales | Entradas independientes, salida 0/1, HTML/JSON/JUnit y evidencia por ejecución | Comandos en sección 6; sin ocultar fallos |
| iOS/BrowserStack | No son requisito para acreditar Android local | iOS no ejecutado; carga BrowserStack bloqueada antes de crear sesión |

## 2. Producto A: ¿qué resultados obtuvieron las API?

**Respuesta.** Ocho de ocho aprobadas en el proyecto api de la ejecución 2026-11-10T21-40-59-483Z. No se infiere cobertura de la tienda a partir de ellas.

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

**Hallazgos de API.** No se demostró incumplimiento del contrato en estos ocho escenarios. Un 500 por campo ausente merece revisión de diseño, pero la documentación no fija un rechazo 400/422. La revisión desplegada exacta del servidor no se ha probado idéntica al [código público de referencia](https://github.com/mwinteringham/restful-booker/blob/619d03162c050baae7d22fdcf983a22f9da6faed/routes/index.js#L300-L321).

## 3. Producto B: ¿qué resultados obtuvo Android?

**Respuesta.** La regresión determinista ejecutó 39 combinaciones Android. En ese intento: 18 aprobadas y 21 fallidas. Se distinguen los defectos de la app de una espera de automatización corregida posteriormente.

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

### ¿Cuáles son los defectos y observaciones, sin contarlos una vez por producto?

| ID y clasificación | Pasos mínimos | Esperado y fuente | Observado e impacto | Evidencia |
| --- | --- | --- | --- | --- |
| APP-01, autenticación | Menú Login → bob@example.com + contraseña sintética incorrecta → ingresar | Rechazo y ausencia de sesión; criterio explícito del reto | Retorna a catálogo y muestra Log Out. Discrepancia del ejercicio; no se afirma vulnerabilidad de un sistema productivo | MOB-02, capturas del paso y menú |
| APP-02, estabilidad | Catálogo inicial → Backpack (green) | Abrir detalle sin terminar la app; expectativa derivada del recorrido | NullPointerException al usar el valor nulo de la posición 1. Impide continuar | CAT-01, log del PID y ProductCatalogFragment.java:156 |
| APP-03, estabilidad | Catálogo inicial → Bike Light, camisetas u otro producto a partir del índice 6 | Abrir detalle del producto; expectativa derivada | 18 reproducciones ArrayIndexOutOfBoundsException, length=6; bloquea gran parte del catálogo. Un defecto agrupado, no 18 bugs nuevos | CAT-01 × 18; log de cada PID/intervalo |
| OBS-01, ambigüedad visual | Detalle Backpack → elegir azul/verde | Conservar variante; cambio de fotografía sin requisito confirmado | Indicador del carrito coincide con el color, pero la foto continúa negra. Falta confirmar intención visual | COLOR-01; imágenes antes/después y muestras 66×66 |
| PERF-01, respuesta UI | Carrito con una unidad → Remove Item | Respuesta fluida; referencia técnica Android, sin SLO acordado | Frame de 5017,56 ms. Bloqueo consistente con bucle deliberado de 5 s de la demo | Diagnóstico nativo de sección 4; no se afirma ANR |

Se propone priorizar los tres defectos de app por bloquear acceso/compra conforme al alcance. Su carácter intencional en la demo se declara; no se modifica la APK ni se omiten las reproducciones.

### ¿Qué se corrigió en la automatización?

- El primer intento de colores capturó pantalla completa al invocar takeScreenshot sobre un elemento. Se sustituyó por takeElementScreenshot; las dos variantes aprobaron, incluidos los RGB del indicador.
- MOB-04 agotaba una espera de cinco segundos mientras la app bloqueaba UI durante cinco segundos. La captura final mostraba No Items. Se amplió el plazo a diez segundos y se verificó de nuevo carrito vacío/sin total. El intento inicial permanece fallido en su reporte.
- La recolección ADB de rendimiento descartó una lectura UI anterior cuando uiautomator no pudo crear un dump nuevo durante el bloqueo. Ahora elimina el archivo previo, exige adquisición nueva y valida postcondiciones. La primera fase de eliminación no se usa como medición válida.

## 4. No funcionales: ¿qué se midió y qué puede concluirse?

**Respuesta.** Diagnóstico local de la APK, ejecución 2026-11-10T22-30-15-267Z, 10 de noviembre de 2026 a las 17:30 de Bogotá. Android 13/API 33, x86_64, 1080×1920, 420 dpi, aproximadamente 60 Hz; APK debug en emulador. No es Web Vitals ni Android Vitals de campo.

| Medición | Resultado observado | Interpretación y límite |
| --- | --- | --- |
| Arranque frío de primera actividad | Cinco muestras: 1740, 1130, 937, 743 y 998 ms; mediana 998 ms | TotalTime de Splash. No demuestra TTFD del catálogo ni lentitud global |
| Scroll controlado del catálogo | HWUI: 52 janky de 382 frames, ≈13,6 % | Diagnóstico local de esta fase; no tasa de usuarios reales |
| Buffer CSV del scroll | 118 muestras; P95 92,88 ms; máximo 404,32 ms; ninguna >700 ms | Buffer parcial, distinto del contador HWUI; no se equiparan sus porcentajes |
| Eliminar un producto | 7 frames en la fase; un frame >700 ms; máximo 5017,56 ms | Evidencia de congelamiento focal. Un frame largo no acredita un ANR |
| Tiempo observado por ADB al eliminar | 7530,36 ms; se confirmó carrito vacío | Incluye comando, adquisición UI y comunicación; no es latencia pura de toque |
| Memoria tras navegar | PSS 105733 KiB, ≈103,25 MiB | Instantánea, no prueba de fuga ni incumplimiento de un límite |
| Abrir Backpack verde | Catálogo ausente después del cierre; NullPointerException del PID 21152 | Diagnóstico de estabilidad separado de las métricas de renderizado |

**Por qué esos tiempos.** A 60 Hz hay unos 16,67 ms por refresco; Android identifica frames sobre 700 ms como congelados. No se aplican umbrales web LCP/INP a la APK. El P95 de una muestra pequeña es descriptivo, no un percentil de población.

**Conclusión para la sustentación.** Hay evidencia de un problema focal de respuesta al eliminar y de cierres reproducibles. No hay fundamento para afirmar que toda la app es lenta por su tiempo inicial de Splash. Para atribuir trabajo de CPU/hilos con mayor detalle se requiere Perfetto/Macrobenchmark, build release, dispositivo físico y más muestras. El código de referencia contiene el bloqueo deliberado; gfxinfo por sí solo no identifica el método causante.

**Evidencia:** reports/performance/2026-11-10T22-30-15-267Z/index.html, summary.json, catalog-scroll-gfxinfo.txt, cart-remove-gfxinfo.txt, crash-current-pid.txt y capturas/XML. La hora del emulador difiere del host; el cierre se correlaciona por PID y reloj del dispositivo, no mezclando timestamps.

Referencias: [arranque](https://developer.android.com/topic/performance/issues/launch-time), [renderizado y frames congelados](https://developer.android.com/topic/performance/issues/render), [límites de gfxinfo](https://developer.android.com/topic/performance/appstartup/analysis-optimization), [Web Vitals](https://web.dev/articles/vitals).

## 5. ¿Qué ejecuciones se conservan y qué significan sus totales?

| ID de ejecución, UTC | Selección | Resultado | Interpretación |
| --- | --- | --- | --- |
| 2026-11-10T21-03-49-082Z | Referencia anterior: 8 API + 9 Android | 14 aprobadas / 3 fallidas | Cobertura anterior, no estado de la ampliación |
| 2026-11-10T21-33-03-546Z | Ocho ampliaciones móviles | 6 / 2 | Fallos de captura de color, corregidos; no defectos de la app |
| 2026-11-10T21-38-26-898Z | Dos variantes de color | 2 / 0 | Confirma corrección del endpoint de screenshot |
| 2026-11-10T21-40-59-483Z | 8 API + 39 Android | 26 / 21 | 19 cierres, login permisivo y timeout inicial de eliminación |
| 2026-11-10T21-59-19-091Z | MOB-04 + tres compras por semilla | 2 / 2 | Eliminación y compra de Backpack amarilla aprobaron; chaqueta roja/camiseta roja reprodujeron cierres |
| 2026-11-10T22-26-59-208Z | Primer protocolo ADB | Recolección preliminar | Se descarta eliminación/cierre por adquisición UI obsoleta; no se mezcla con medición final |
| 2026-11-10T22-30-15-267Z | Diagnóstico ADB corregido | Recolección validada, 96 s | Arranque, scroll, eliminación y cierre corroborados; no constituye un gate de rendimiento |

No se suman reejecuciones como nuevos casos ni se reescribe la regresión completa tras un resultado focalizado. No hubo skips ni reintentos automáticos para ocultar fallos. Un reporte funcional puede terminar con código 1 por defectos reales; que el recolector de diagnóstico termine con 0 significa que recolectó datos válidos, no que la app haya pasado un SLO.

La semilla felipe-20261110 generó Backpack amarilla (1), Fleece Jacket roja (2) y Bolt T-Shirt roja (2). La misma semilla repitió la selección; otra cambió los casos y una muestra mayor de 24 se rechazó. Evidencia: artifacts/product-data-verification.json.

## 6. ¿Cómo revisar y reproducir los resultados?

~~~powershell
npm.cmd run report:all -- 2026-11-10T21-40-59-483Z
npm.cmd run report:mobile -- 2026-11-10T21-59-19-091Z
npm.cmd run perf:android
npm.cmd run report:performance
~~~

El HTML funcional conserva proyectos, tags, pasos descriptivos, diff esperado/obtenido y adjuntos. El diagnóstico nativo tiene su propio HTML/JSON y archivos crudos. La revisión visual del reporte funcional ampliado pasó sin errores JavaScript; capturas en artifacts/report-review/2026-11-10T21-40-59-483Z.

Se revisaron TypeScript estricto, imports/parámetros sin uso y sintaxis de scripts. El descubrimiento histórico de dos perfiles produjo 86 combinaciones; solo el primario fue ejecutado. El workflow manual anterior nunca se ejecutó y se retiró en la revisión final.

## 7. ¿Cómo se utilizó IA y qué revisión se hizo?

**Respuesta.** Se creó y conservó .agents/skills/mobile-native-tests/SKILL.md en 4d786db antes de utilizarla. El agente implementó el caso positivo parametrizado y produjo el resultado móvil en 19c7073; las ampliaciones estructurales y de cobertura quedaron en 64f59b6.

Invocación operacional: implementar carrito nativo con Screen Objects, acciones inyectadas, datos/expectativas previas, sesiones independientes y evidencia; ejecutar, revisar fallos y corregir automatización sin debilitar aserciones. Es una descripción de la invocación, no una cita literal del usuario.

**Herramienta:** Codex en ChatGPT Work sobre el PC autorizado. **Modelo exacto:** no expuesto verificablemente en esta interfaz. No se inventa un identificador.

Felipe revisó manualmente los cierres y pidió separar modelos/contratos/pantallas, ampliar datos y formalizar documentación. La revisión del agente contrastó código, reportes y logs; no sustituye aprobación humana final. Invocaciones/correcciones en artifacts/ai/native-skill-invocation.json y domain-refactor-invocation.json. Captura de elementos y espera de eliminación son correcciones de automatización; los defectos de la demo permanecen visibles.

### ¿Cómo ampliar un caso durante la entrevista?

El skill vigente incorpora las capas separadas, datos reales/semilla, precios en centavos, oráculos previos, tags, espera de eliminación y distinción entre cierre, timeout y evidencia antigua. Sus referencias contienen un contrato de revisión y una guía del agente; agents/openai.yaml aporta nombre e invocación sugerida para herramientas compatibles. No crea un subagente ni instala MCPs.

Desde el README, skill:prompt prepara una solicitud portable. El agente debe leer el skill, revisar escenarios existentes, proponer el dato/esperado, implementar por capas, descubrir el ID y ejecutar solo ese caso. Un MCP facilita acceso a código/terminal o UI, pero no interpreta por sí mismo las instrucciones del skill.

Una demostración útil es agregar una unidad, eliminarla y agregar dos nuevamente: comprueba recuperación sin cantidad/total anterior y aporta más que duplicar MOB-04. Otra opción es 60 unidades de Backpack con total USD 1799,40: requiere revisar tiempo de pulsaciones y alcance, no asumir 60 referencias distintas. El rango del helper no es un máximo de negocio acreditado.

La aceptación exige código revisado, aserciones significativas y evidencia de sesión real. Sin dispositivo se informa implementación/descubrimiento pendiente de ejecución. No se promete que cualquier agente o MCP pueda hacerlo sin las capacidades necesarias.

## 8. ¿Qué otras tres skills se proponen y cuál se construiría primero?

| Propuesta | Propósito y usuario | Entradas → salidas | Verificación y prioridad |
| --- | --- | --- | --- |
| Triage de fallos | Ayudar a QA a separar app, automatización y entorno en cada producto | Reportes/logs/capturas → diagnóstico con fuente, impacto y duda pendiente | Contrastar con reproducción y revisión humana; P1, primera |
| Revisión de matriz | Ayudar a QA/DevOps a elegir plataformas sin duplicar estado o exceder cuota | Compatibilidad, capacidades, cuota → matriz acotada y configuración | Verificar puertos, sesiones y resultados reales por plataforma; P2 |
| Preparación de entrega | Ayudar a QA/lead a mantener respuestas verificables al enunciado | Requisitos, código, resultados → actualización de los tres documentos y evidencia faltante | Cada afirmación debe apuntar a prueba/fuente; P2 |

Se construiría primero triage: ya hay cierres, un login permisivo y problemas de captura/espera que requieren clasificación distinta. Medir tiempo hasta diagnóstico correcto y concordancia con revisión humana antes/después; no inventar una mejora porcentual.

Checksum, detección de puertos, extracción de estadísticas y validación de esquemas se resuelven con scripts deterministas; no necesitan otra skill o una inferencia de IA.

## 9. ¿Por qué se omite pipeline y cómo se conectaría BrowserStack?

**Decisión de entrega.** No se ejecuta pipeline ni nube. Se retiró .github/workflows/mobile.yml. No se mantiene una conexión App Automate operativa y no se adquiere capacidad de pago para este ejercicio. El intento previo devolvió 422 al cargar la APK, sin sesión; no se afirma que su causa sea una cuota o el coste. API y Android siguen ejecutándose localmente. Un pipeline con emulador local sería técnicamente posible sin BrowserStack, pero queda fuera del alcance acordado.

**Punto de extensión, no implementación validada.** Hoy native.fixture.ts fija localhost, Android, ADB y las screens Android. scripts/browserstack/android-connection.mjs es una comprobación independiente de carga/conexión; no conecta la regresión ni cubre iOS. La futura integración debe separar endpoints/capabilities en config/mobile, crear una factoría de sesión en src/mobile/session y seleccionar/adaptar pantallas y diagnóstico desde el fixture.

| Ubicación | Ajuste futuro |
| --- | --- |
| .env / secretos del ejecutor | BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY; app_url por plataforma |
| config/mobile | Perfil cloud con dispositivo y versión realmente disponibles |
| src/mobile/session | Crear/cerrar remote; separar local/cloud sin filtrar credenciales en adjuntos |
| tests/mobile/fixtures/native.fixture.ts | Inyectar sesión y pantallas; reemplazar diagnóstico ADB local en cloud |
| config/mobile/playwright.config.ts | Un proyecto por perfil, un worker por dispositivo y límite total según cuota |

Variables del ejemplo .env.example: BROWSERSTACK_ANDROID_APP y BROWSERSTACK_IOS_APP contendrían bs://… tras una carga válida. No se usa un “client ID”: App Automate autentica con username/access key. Mantenerlos fuera de Git y de logs. La clave no debe adjuntarse dentro de capabilities ni de resúmenes.

~~~typescript
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

**Paralelismo propuesto.** Cada proyecto crea su sesión y datos aislados. El máximo concurrente debe respetar los paralelos disponibles del plan; multiplicar jobs de una matriz por workers puede excederlo. Limitar ambos niveles, cerrar sesiones aun al fallar y recuperar session ID, URL, capturas y logs sanitizados. El perfil local secundario tampoco se considera ejecutado por estar en JSON.

Fuente: [WebdriverIO en App Automate](https://www.browserstack.com/docs/app-automate/appium/getting-started/nodejs/webdriverio) y [sesiones/paralelos](https://www.browserstack.com/docs/browserstack-mcp-server/tools/app-automate). No se publican precios no comprobados ni se consumió una sesión cloud en esta revisión.

## 10. ¿Qué queda pendiente antes de entregar o ampliar a iOS?

Revisión final del README por Felipe, acceso del evaluador al repositorio privado, tiempo humano efectivamente invertido, y revisión humana de conclusiones. Los tiempos automáticos de la tabla no equivalen a horas humanas; no se afirma haber cumplido una dedicación específica.

Checkout completo, multiproducto, segundo plano, build release/dispositivo físico y diagnóstico Perfetto siguen sin ejecución. iOS requiere instalador/proveedor, localizadores y sesión real; BrowserStack continúa bloqueado por carga 422. No se compró cuota ni se tocó la cuenta AWS del banco.

.gitignore ya existe: excluye credenciales, instaladores y evidencia generada. Se comprueba también para reports/performance; no se publica evidencia sensible. npm audit registró 45 avisos en herramientas de desarrollo; queda pendiente triage compatible, sin corrección forzada.

**Recomendación:** presentar las capacidades y hallazgos con sus límites. No declarar la APK aprobada para todos los productos o plataformas. Las API tienen ocho verificaciones aprobadas; los defectos de la demo y las brechas de cobertura móvil se entregan de forma explícita.
