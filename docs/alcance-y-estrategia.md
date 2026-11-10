# Alcance y estrategia

El reto exige app instalada, Page/Screen Objects, API con Playwright Test TypeScript, dos conjuntos de datos móviles, una skill usada por un agente y evidencia verificable. Android local cumple el mínimo; iOS y nube son extensiones solicitadas por Felipe.

## Cobertura vigente y fuentes de expectativas

La regresión descubre 47 ejecuciones con el perfil primario: 8 API y 39 Android. El perfil exploratorio predeterminado selecciona 3 compras adicionales por semilla y queda fuera de la regresión. Descubrimiento no significa aprobación.

| Caso | Expectativa y fuente | Etiquetas |
| --- | --- | --- |
| CAT-01, 24 productos | Catálogo completo; abrir detalle y comparar nombre/precio de referencia. Continuidad sin cierre es una expectativa derivada del recorrido de compra. Incluye las dos reproducciones antes llamadas MOB-05. | regression, catalog |
| CART-01 | Aumentar a 3 y reducir a 1 recalcula unidades e importe; criterio de cantidad/precio del reto y cálculo aritmético. | regression, cart, quantity |
| CART-02 | Decrementar la última unidad retira el producto; caracterización de CartItemAdapter 2.3.0. | regression, cart, boundary |
| DETAIL-01 | Con cero unidades se deshabilita agregar y con una se recupera; ProductDetailFragment 2.3.0. | regression, negative, boundary |
| COLOR-01, Blue/Green | La variante elegida llega al carrito sin alterar producto/importes; expectativa derivada del flujo ampliado solicitado. | regression, color |
| COLOR-02 | El indicador del carrito no edita la variante; caracterización de la implementación, no regla del evaluador. | regression, color, characterization |
| REVIEW-01, 1/5 estrellas | Confirmación, cierre y continuidad; dialog_review.xml y Methods.showReviewDialog. No afirma persistencia de reseñas. | regression, review, boundary |
| GEN-01 | Compra con productos reales, cantidades sintéticas y semilla adjunta; sin filtrar productos problemáticos. | exploratory, random |

Login inválido conserva el criterio explícito del reto: rechazo y ausencia de sesión. Se retiró la exigencia adicional de permanecer en el formulario, porque no estaba especificada. Cambiar la fotografía al elegir color tampoco es un criterio confirmado: se registra como observación/ambigüedad y se adjuntan imágenes, sin inventar un defecto.

El barrido completo evita que una selección aleatoria deje productos sin visitar. La expansión no confunde fallos de datos distintos con defectos diferentes; se agrupan por síntoma, excepción y punto de fallo.

Siguiente cobertura por riesgo: checkout incompleto; acumulación de varios productos/variantes y total del pedido; segundo plano/recuperación. El máximo de cantidad de negocio sigue sin especificación.


| Caso estable | Comprobación | Etiquetas |
| --- | --- | --- |
| MOB-01 D1/D2 | Backpack con 1/2 unidades; nombre, cantidad, precio unitario y total fijados antes de ejecutar | smoke, regression, cart |
| MOB-02 | Contraseña incorrecta: rechazo y ausencia de sesión, criterio explícito del reto | regression, negative, known-issue |
| MOB-03 | Back nativo hasta catálogo y contenido del carrito conservado | smoke, regression, native, back |
| MOB-04 | Retirar el único producto deja carrito vacío | regression, cart |
| MOB-06 | Usuario vacío: rechazo del formulario y usuario sin autenticar | smoke, regression, negative |
| MOB-07 | Scroll nativo hacia Bike Light y regreso a Backpack sin cambiar carrito | regression, native, scroll |
| API-01 a API-08 | Crear, consultar, listar, PUT, PATCH, DELETE, rechazo y aislamiento | api, regression; API-01 smoke |

Smoke selecciona cinco ejecuciones. API-02 caracteriza el 500 de la implementación al omitir firstname: el campo es obligatorio, pero el estado de rechazo no está especificado en la documentación. No se presenta como incumplimiento contractual. Los dos datos fijos de carrito no sustituyen el barrido completo ni la exploración.

## Datos, aislamiento y revisión

Una sesión Appium nueva por prueba, noReset=false y cierre garantizado. Antes del escenario se desbloquea el dispositivo y, si quedó abierto, se cierra el panel de notificaciones. No se comparte el UDID entre workers. Las esperas dependen de condiciones; el scroll verifica que la app permanezca en primer plano antes de actuar.

Los fixtures API usan UUID completos y consultas previas/posteriores. La limpieza comprueba que cada registro sigue perteneciendo al test antes de eliminarlo. Esto verifica consistencia observable y aislamiento, no durabilidad tras reinicios ni unicidad global.

No hay skips ni reintentos automáticos para disimular fallos. Se conservan también intentos con problemas de entorno o sincronización, diferenciándolos de los hallazgos de la app.


## IA y adopción

Las instrucciones de implementación están en .agents/skills/mobile-native-tests/SKILL.md, conservadas antes del primer escenario móvil en 4d786db. La invocación, la revisión del agente y sus correcciones se documentan en resultados. No se registra una aprobación humana inexistente.

| Propuesta | Usuario, entradas y salida | Verificación y prioridad |
| --- | --- | --- |
| Triage de fallos móviles | QA; recibe reporte, logs, capturas y árbol UI; entrega diagnóstico con evidencia y clasificación app/automatización/entorno | Contrastar con reproducción y revisión humana, sin debilitar aserciones. P1 |
| Revisión de matriz de dispositivos | QA/DevOps; recibe compatibilidad, cuota y capacidad; entrega matriz acotada con aislamiento de sesiones y puertos | Comprobar arranque y reportes por dispositivo. P2 |
| Preparación de entrega QA | QA/lead; recibe resultados, versiones, riesgos y enlaces; actualiza los documentos consolidados | Comprobar cada afirmación contra una evidencia real. P2 |

Construir primero el triage: este ejercicio ya muestra cierres de la app, un login permisivo y errores de preparación distintos. Medir tiempo de diagnóstico y coincidencia de clasificación con revisión humana antes/después, sin inventar una mejora porcentual. Descargas con checksum, extracción de estadísticas y validación de puertos deben seguir siendo scripts deterministas, no nuevas skills.


En este barrido se mantuvo el orden inicial del catálogo. Los defectos de metadatos dependen de la posición del elemento (valor nulo en la posición 1 y arreglo de seis posiciones), no de una regla propia de cada SKU/color. Los nombres identifican reproducciones observadas en ese orden. Cambiar el orden para aislar esta condición y alcanzar flujos bloqueados es una exploración posterior; no se afirma que los 24 productos hayan completado una compra.
