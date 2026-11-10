# Resultados y pendientes

Revisión del 10 de noviembre de 2026, PC Windows de Felipe.

## Revisión de estructura y cobertura ampliada

Se separaron modelos, interfaces de comportamiento, cuatro pantallas y dos componentes compartidos. Los specs se agrupan por funcionalidad y se retiraron cinco .gitkeep. No se presenta Screen Objects como Screenplay completo.

### Ejecuciones observadas

| Ejecución | Selección | Aprobados | Fallidos | Interpretación |
| --- | --- | ---: | ---: | --- |
| 2026-11-10T21-40-59-483Z | 8 API + 39 Android | 26 | 21 | Incluye cierres de catálogo, login permisivo y el plazo insuficiente de eliminación del primer intento |
| 2026-11-10T21-59-19-091Z | MOB-04 + tres compras con semilla | 2 | 2 | Eliminación verificada tras ajustar espera; los productos generados conservan sus resultados reales |

API en la regresión: 8/8 aprobadas. Android: 18/39 aprobadas en ese intento. Barrido de catálogo: 5/24 detalles consultados correctamente y 19 cierres/fallos conservados. Sin omisiones ni reintentos automáticos.

Las ocho ampliaciones de cantidad, cero, color y reseña aprobaron. La ejecución inicial focalizada 2026-11-10T21-33-03-546Z registró 6 aprobadas y 2 fallidas por una captura de color incorrecta. Se corrigió el endpoint de screenshot y las dos variantes aprobaron en 2026-11-10T21-38-26-898Z y en la regresión ampliada; no eran defectos de la app.

### Catálogo completo

| Producto | Resultado al consultar detalle |
| --- | --- |
| Sauce Labs Backpack | Aprobado |
| Sauce Labs Backpack (green) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Backpack (orange) | Aprobado |
| Sauce Labs Backpack (red) | Aprobado |
| Sauce Labs Backpack (violet) | Aprobado |
| Sauce Labs Backpack (yellow) | Aprobado |
| Sauce Labs Bike Light | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Bolt T-Shirt | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Bolt T-Shirt (blue) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Bolt T-Shirt (green) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Bolt T-Shirt (red) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Bolt T-Shirt (yellow) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket (blue) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket (brown) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket (green) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket (pink) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Fleece Jacket (red) | Fallido; ver cierre y evidencia del caso |
| Sauce Labs Onesie | Fallido; ver cierre y evidencia del caso |
| Test.allTheThings() T-Shirt | Fallido; ver cierre y evidencia del caso |
| Test.allTheThings() T-Shirt (turquoise) | Fallido; ver cierre y evidencia del caso |
| Test.allTheThings() T-Shirt (pink) | Fallido; ver cierre y evidencia del caso |
| Test.allTheThings() T-Shirt (purple) | Fallido; ver cierre y evidencia del caso |
| Test.allTheThings() T-Shirt (yellow) | Fallido; ver cierre y evidencia del caso |

Los 19 cierres del barrido se agrupan en dos causas confirmadas por logs: 1 NullPointerException y 18 ArrayIndexOutOfBoundsException. Los productos fallidos no se cuentan automáticamente como defectos distintos. Se contrastan los logs Android dentro del intervalo de cada caso, UTC del emulador, y el código público ProductCatalogFragment 2.3.0. La mochila verde presenta el acceso nulo conocido; los índices fuera del arreglo de metadatos afectan otros productos. El desglose técnico queda en artifacts/catalog-findings-2026-11-10T21-40-59-483Z.json y en los adjuntos de cada test.

### Comprobación focalizada y datos sintéticos

Semilla ejecutada: felipe-20261110, muestra 3.

| Caso | Resultado |
| --- | --- |
| MOB-04 \| Eliminar el único producto deja el carrito vacío | Aprobado |
| GEN-01 R1 \| Comprar 1 unidad de Sauce Labs Backpack (yellow) | Aprobado |
| GEN-01 R2 \| Comprar 2 unidades de Sauce Labs Fleece Jacket (red) | Fallido |
| GEN-01 R3 \| Comprar 2 unidades de Sauce Labs Bolt T-Shirt (red) | Fallido |

MOB-04 agotó inicialmente una espera de 5 segundos. La captura final mostraba No Items; CartItemAdapter bloquea intencionalmente el hilo UI durante 5 segundos al eliminar. La espera ahora admite 10 segundos y mantiene la aserción de carrito vacío/sin total. El intento original se conserva y la comprobación posterior aprobó. No se declara un defecto funcional por aquel timeout; el bloqueo UI se registra como observación de rendimiento sin SLO acordado.

La fábrica no excluye productos por sus fallos y fija precio/cantidad/total antes de interactuar. Se verificaron misma semilla/misma selección, cambio de selección con otra semilla y rechazo de muestra mayor que 24; evidencia artifacts/product-data-verification.json.

### Colores, imágenes y reseña

Las muestras Blue/Green llegan al carrito con RGB (14,117,221)/(62,220,145); se comprobaron recortes reales de 66x66. La fotografía sigue mostrando la mochila negra al elegir azul, observado visualmente en las capturas; las diferencias de píxeles incluyen el indicador de scroll y no prueban cambio de variante. Se conserva como ambigüedad visual a confirmar, no como incumplimiento de una regla inventada. El indicador del carrito se caracteriza como solo lectura.

Las valoraciones de 1/5 estrellas muestran confirmación, permiten continuar y no agregan el producto al carrito. No hay evidencia de persistencia de reseñas en backend.

### Reproducibilidad y revisión

Reporte completo: npm.cmd run report:all -- 2026-11-10T21-40-59-483Z. Comprobación focalizada: npm.cmd run report:mobile -- 2026-11-10T21-59-19-091Z. Se conservaron HTML/JSON/JUnit, pasos y evidencias por ejecución. La revisión estática incluyó imports/parámetros sin uso; ahora el compilador lo exige en tsconfig. El descubrimiento de dos perfiles produjo 86 combinaciones de regresión, sin ejecutar el segundo AVD. La matriz de GitHub se validó, se amplió a 40 minutos y no se ejecutó.

El feedback de Felipe motivó la separación y la cobertura ampliada. Se registra su reproducción manual informada sin inventar tiempos ni aprobación formal. Invocación y correcciones: artifacts/ai/domain-refactor-invocation.json. Continúan pendientes nube/iOS, visual Archify actualizada y triage de las 45 advertencias de herramientas.

## Referencia conjunta anterior

RunId: 2026-11-10T21-03-49-082Z. API y Android se ejecutaron en una invocación Playwright con reporte HTML/JSON/JUnit y resumen estructurado. Resultado: 14 aprobados, 3 fallidos, 0 omitidos; sin reintentos. Duración automática: 206.2 segundos. Los resultados no representan el tiempo humano de trabajo.

| Proyecto | Escenario | Resultado |
| --- | --- | --- |
| api | API-01 \| Consultar una reserva recién creada devuelve los datos registrados | Aprobado |
| api | API-02 \| Una reserva sin nombre se rechaza y no queda registrada | Aprobado |
| api | API-03 \| Buscar reservas por huésped devuelve el registro creado | Aprobado |
| api | API-04 \| Los cambios de una reserva se conservan al consultarla de nuevo | Aprobado |
| api | API-05 \| Cambiar una preferencia conserva el resto de la reserva | Aprobado |
| api | API-06 \| Una reserva eliminada deja de aparecer en las consultas | Aprobado |
| api | API-07 \| Una actualización sin autorización no modifica la reserva | Aprobado |
| api | API-08 \| Las búsquedas distinguen dos reservas con datos de prueba diferentes | Aprobado |
| android-local-primary | MOB-01 D1 \| El carrito conserva 1 unidad de Sauce Labs Backpack | Aprobado |
| android-local-primary | MOB-01 D2 \| El carrito conserva 2 unidades de Sauce Labs Backpack | Aprobado |
| android-local-primary | MOB-02 \| Una contraseña incorrecta impide iniciar sesión | Fallido |
| android-local-primary | MOB-03 \| Volver al catálogo conserva el contenido del carrito | Aprobado |
| android-local-primary | MOB-04 \| Eliminar el único producto deja el carrito vacío | Aprobado |
| android-local-primary | MOB-05 \| Abrir Sauce Labs Bike Light muestra su detalle sin cerrar la app | Fallido |
| android-local-primary | MOB-05 \| Abrir Sauce Labs Backpack (green) muestra su detalle sin cerrar la app | Fallido |
| android-local-primary | MOB-06 \| Un usuario vacío impide enviar el inicio de sesión | Aprobado |
| android-local-primary | MOB-07 \| El scroll permite localizar un producto sin modificar el carrito | Aprobado |

Abrir con npm.cmd run report:all -- 2026-11-10T21-03-49-082Z. Evidencia en reports/combined/2026-11-10T21-03-49-082Z. El resumen identifica el proyecto y la ruta del paso fallido. El servidor Appium gestionado por el comando se cerró al terminar; su salida conserva el código de las pruebas.

Se verificó además la selección de cinco casos smoke y dos negativos API; estos dos negativos aprobaron en la ejecución independiente 2026-11-10T20-57-43-560Z. El descubrimiento conjunto con ambos perfiles produjo 26 combinaciones (8 API y 9 por dispositivo), sin ejecutar el segundo emulador.

Los intentos conjuntos 2026-11-10T20-51-37-040Z (13 aprobados/4 fallidos) y 2026-11-10T20-56-25-864Z (12/5), y el smoke 2026-11-10T21-01-51-625Z (4/1), se conservan. Incluyeron fallos adicionales de sincronización en el control de cantidad/agregado al carrito. Se ajustó la exposición del control y la espera de posición estable antes de pulsar; no se cambiaron los importes ni las aserciones para hacerlos pasar. MOB-07 aporta evidencia de scroll nativo hacia abajo/arriba y carrito sin cambios.

El HTML conjunto se abrió con Chrome headless: 17 casos, 14 aprobados y 3 fallidos, sin errores JavaScript del reporte. Se inspeccionó visualmente MOB-02: pasos en español, diff esperado/obtenido, captura en cada paso fallido y adjuntos de contexto/árbol UI. Evidencia local: artifacts/report-review/combined-overview.png, failed-step-detail.png y verification.json. Se verificaron 103 adjuntos y las rutas de los pasos fallidos. Los cinco casos smoke aprobaron dentro de esta regresión; esto no demuestra ausencia de intermitencias futuras.

Typecheck, sintaxis de runners, YAML de la matriz y git diff --check fueron comprobados localmente. La matriz de GitHub no se ejecutó. El smoke como selección y el descubrimiento no sustituyen la regresión.

## Referencias anteriores: ejecución independiente

API: 8 aprobados, 0 fallos; salida 0, 14,5 segundos en la referencia anterior.

Referencia móvil anterior: 5 aprobados, 3 fallidos, 0 omitidos; salida 1. Ejecución 2026-11-10T20-13-25-414Z, duración automática 167.9 segundos. Este tiempo no equivale a la dedicación humana acumulada.

| Caso | Resultado |
| --- | --- |
| MOB-01 D1 — El carrito conserva 1 unidad de Sauce Labs Backpack | Aprobado |
| MOB-01 D2 — El carrito conserva 2 unidades de Sauce Labs Backpack | Aprobado |
| MOB-02 — Una contraseña incorrecta impide iniciar sesión | Fallido |
| MOB-03 — Volver al catálogo conserva el contenido del carrito | Aprobado |
| MOB-04 — Eliminar el único producto deja el carrito vacío | Aprobado |
| MOB-05 — Abrir Sauce Labs Bike Light muestra su detalle sin cerrar la app | Fallido |
| MOB-05 — Abrir Sauce Labs Backpack (green) muestra su detalle sin cerrar la app | Fallido |
| MOB-06 — Un usuario vacío impide enviar el inicio de sesión | Aprobado |

El reporte está en reports/mobile/2026-11-10T20-13-25-414Z/html. Cada caso adjunta servidor Appium, sesión, captura, árbol UI y buffer de cierres Android. Los logs Appium y el registro de orquestación CI están en artifacts/android-local. El buffer Android incluye historial del dispositivo: correlacionar por hora y proceso, no atribuir todos sus eventos al test actual.

El comando test:mobile:ci se ejecutó en el PC con Appium real. Se comprobó el cierre de su servidor: verificado, /status dejó de estar disponible. La matriz API 30/33 de GitHub solo pasó revisión de configuración/YAML; no se ejecutó remotamente.

## Hallazgos conservados

### MOB-05: cierres al abrir productos

Preparación: APK My Demo App 2.3.0 build 27 y sesión limpia. Abrir la imagen de Bike Light o Backpack (green) desde el catálogo.

Esperado: detalle con el nombre y precio seleccionados, sin terminar la app.

Observado: Bike Light produce ArrayIndexOutOfBoundsException, length=6/index=6; la mochila verde produce NullPointerException al invocar Integer.intValue. Ambos apuntan a ProductCatalogFragment.java:156 en el log Android. El código público de referencia contiene fallos intencionales de demostración; se reportan como defectos conocidos de la demo, sin corregir ni modificar la APK.

Evidencia: capturas, árboles UI, logs Android adjuntos a MOB-05 y crash-bikelight-first-run.log. Los dos productos permanecen como casos de regresión fallidos, sin skips ni reintentos.

### MOB-02: contraseña incorrecta sin rechazo

Preparación: formulario de login, usuario de práctica bob@example.com y contraseña sintética incorrecta.

Esperado según el criterio del ejercicio: rechazo visible y ausencia de sesión válida. Se retiró la exigencia adicional de permanecer en el formulario, que no estaba documentada.

Observado: vuelve al catálogo y el menú ofrece cerrar sesión. La demo tiene autenticación permisiva; no se afirma incumplimiento de un contrato de autenticación formal ni una vulnerabilidad de un sistema real. Se conserva la discrepancia y su expectativa estricta. MOB-06 verifica por separado el rechazo documentado de usuario vacío.

## Correcciones de automatización y entorno

La primera conexión falló por ausencia de apksigner.jar. Se instalaron Build Tools 35 y se reinició Appium para actualizar su detección del SDK. El doctor del driver no había marcado ese requisito específico como obligatorio.

Se corrigió la sincronización de un título fuera de pantalla al volver. Se cambió la pulsación del control de cantidad a un gesto nativo por ID; la espera sigue exigiendo el valor exacto. Los dos datos positivos ahora usan Backpack con cantidades 1 y 2. Bike Light y la mochila verde no se eliminaron de la cobertura: se conservaron en MOB-05.

El panel de notificaciones apareció tras un cierre de la app y la búsqueda posterior sobre la pantalla del sistema; no se atribuye sin evidencia a intervención manual. El scroll ahora comprueba el paquete activo, y la preparación cierra un panel del sistema si había quedado abierto. La carrera de arranque entre suite y servidor se resolvió esperando /status.

Se conservaron todas las ejecuciones por ID, incluidas las fallidas por preparación. No son pruebas aprobadas ni se confunden con defectos nuevos de la app.

## Evidencia de IA y revisión

Instrucciones previas: .agents/skills/mobile-native-tests/SKILL.md, commit 4d786db. Se leyeron y aplicaron antes de implementar el caso de carrito.

Invocación operacional del agente: aplicar mobile-native-tests para implementar el carrito parametrizado con Screen Objects, acciones inyectadas, expectativas previas y evidencia nativa, y revisar los resultados sin ocultar fallos. No es una cita literal del usuario ni una aprobación humana.

Herramienta: Codex en ChatGPT Work, operando el PC autorizado. Modelo exacto: no expuesto de forma verificable en esta interfaz. No se inventa el identificador. Se conservaron cambios en Git, reportes y registro local artifacts/ai/native-skill-invocation.json. La revisión del agente contrastó código y ejecución; no sustituye revisión humana.

## API y contrato

Los ocho escenarios de reservas siguen juntos en bookings.spec.ts. API-02 caracteriza el 500 explícito del código público al omitir firstname y verifica ausencia de registro. La documentación exige el campo, pero no especifica ese estado de rechazo. No se clasifica como incumplimiento contractual.

Referencia: [implementación de Booker](https://github.com/mwinteringham/restful-booker/blob/619d03162c050baae7d22fdcf983a22f9da6faed/routes/index.js#L300-L321). La revisión exacta desplegada no está demostrada.

## Riesgos y pendientes

- npm audit informó 45 avisos en herramientas de desarrollo: 1 bajo, 15 moderados, 26 altos y 3 críticos. Pendiente de triage de alcance y actualización compatible; no se aplicó una corrección forzada ni una degradación automática de Appium. El servidor se limita a localhost. Informe local: artifacts/npm-audit-native.json.
- BrowserStack autentica, pero rechaza la carga con BROWSERSTACK_UNPROCESSABLE_ENTITY/422. Su guía contempla cuota agotada o restricción de detección; no se confirmó cuál aplica.
- AWS: acceso personal y minutos gratuitos no verificados. No se accedió ni modificó la cuenta del banco.
- iOS y matriz remota no ejecutados. Una ejecución Android local no demuestra compatibilidad iOS ni ejecución paralela real.
- Mediciones de rendimiento completas, actualización de la visual Archify, revisión humana, tiempo humano total y acceso del evaluador al repositorio privado pendientes.

## Preparación del fixture para varios emuladores

Typecheck aprobado con la opción deviceProfile. El descubrimiento de android-local-primary y android-local-secondary mostró inicialmente 16 combinaciones: ocho escenarios por perfil, sin sesiones Appium. La selección de un nombre repetido se rechazó con salida 1 antes de iniciar pruebas. Esto valida configuración y descubrimiento; no acredita ejecución simultánea en dos emuladores.

La regresión completa indicada arriba corresponde al entorno local previamente verificado. La comprobación del fixture parametrizado sobre el perfil primario se registró en una ejecución smoke separada, sin sustituir ni ocultar los tres fallos conocidos de la regresión.

Comprobación posterior del fixture parametrizado: 2026-11-10T20-23-42-320Z, 2 aprobados, 0 fallos, 0 omitidos; salida 0. test:mobile:ci inició y cerró su Appium; /status dejó de responder al terminar. Solo se usó android-local-primary. Los 16 escenarios descubiertos para dos perfiles no se cuentan como ejecutados ni aprobados.

La revisión visual del HTML ampliado se realizó con Chrome headless: sin errores JavaScript del reporte, con escenario, pasos y diff original visibles. Evidencia local: artifacts/report-review/2026-11-10T21-40-59-483Z/verification.json y sus capturas. La comprobación focalizada posterior no sustituye ni reescribe el resultado del intento de regresión completo.
