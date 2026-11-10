# Alcance y estrategia de pruebas


## 1. ¿Qué se debe probar y cómo se considera?

**Respuesta.** El ejercicio se aborda como dos productos independientes, cada uno con sus propios recorridos y criterios de prueba. Se entregan dos proyectos de automatización dentro de un repositorio TypeScript para compartir dependencias y convenciones, y centralizar la revisión.

| Producto | Objetivo | Herramientas | Entradas y evidencia |
| --- | --- | --- | --- |
| A. API Restful Booker | Verificar reservas, integridad de datos y autorización | Playwright Test, APIRequestContext, TypeScript | Credenciales de práctica y reservas sintéticas; historial HTTP, JSON/JUnit/HTML |
| B. APK My Demo App | Verificar recorridos nativos, carrito, autenticación y navegación | Playwright Test como runner; WebdriverIO, Appium y UiAutomator2 para Android | APK 2.3.0 build 27, emulador y sesión independiente; capturas, árbol UI y logs |

La API puede ejecutarse sin Android/Appium; Android no necesita credenciales de Booker. Las carpetas src/api y tests/api se separan de src/mobile y tests/mobile. El reporte conjunto es una agregación operativa, no una prueba de integración entre productos.

## 2. ¿Cómo se priorizan las pruebas?

**Respuesta.** Se prioriza por impacto del fallo en el recorrido y riesgo de pérdida/inconsistencia de datos. También se consideran la pirámide de pruebas y el tiempo y los recursos de ejecución. P1 se ejecuta primero; P2 amplía cobertura de riesgos relevantes; P3 caracteriza comportamientos de menor impacto.

El resultado esperado tiene una fuente explícita:

- **E:** requisito del ejercicio.
- **D:** expectativa derivada del recorrido y de la exploración de la APK; requiere confirmación cuando el enunciado no fija una regla.
- **C:** caracterización de la implementación pública 2.3.0, sin presentarla como requisito del evaluador.

Las condiciones no especificadas se registran como preguntas. Los resultados observados están en [resultados](resultados.md).

## 3. Producto A: API Restful Booker

### 3.1 ¿Cuál es el alcance funcional de la API?

**Respuesta.** Ocho escenarios automatizados sobre reservas: creación/consulta, búsqueda, actualización total/parcial, eliminación, rechazo, autorización y aislamiento. Todos se mantienen en [bookings.spec.ts](../tests/api/specs/bookings.spec.ts), con [cliente separado](../src/api/clients/booking.client.ts).

| Código | Escenario y riesgo que justifica su selección | Resultado esperado | Prioridad | Impacto del fallo |
| --- | --- | --- | --- | --- |
| API-01 | Crear y consultar; evitar confirmar una reserva que no se pueda recuperar | POST 200, ID entero positivo y GET 200 con los datos completos registrados (E) | P1 | Alto: reserva ausente o datos incorrectos |
| API-02 | Omitir firstname; evitar guardar solicitudes incompletas | Rechazo sin ID ni reserva persistida. Se caracteriza HTTP 500 de la implementación; el estado no está fijado por la documentación (E/C) | P1 | Alto: integridad de registros y manejo de error |
| API-03 | Listar y filtrar por huésped; evitar búsquedas que omitan o mezclen reservas | GET 200; listado contiene el ID creado y filtro devuelve únicamente la reserva propia (D) | P2 | Medio: recuperación incorrecta de información |
| API-04 | Reemplazar datos con PUT; detectar cambios confirmados que no se guardan | PUT 200 y nueva consulta con todos los cambios esperados (D) | P1 | Alto: pérdida o inconsistencia de actualizaciones |
| API-05 | Modificar preferencias con PATCH; evitar sobrescribir campos no solicitados | PATCH 200; GET confirma la preferencia nueva y el resto permanece intacto (D) | P2 | Alto: modificación involuntaria de otros datos |
| API-06 | Eliminar una reserva existente; evitar registros que continúen disponibles | DELETE 201; GET 404 y búsqueda sin el ID eliminado (D/C) | P1 | Alto: eliminación inefectiva |
| API-07 | Intentar PUT sin autorización; proteger el estado original | HTTP 403 y GET posterior conserva la reserva sin cambios (D/C) | P1 | Alto: modificación no autorizada |
| API-08 | Crear dos huéspedes sintéticos; detectar cruces de datos y falsos positivos | IDs distintos; cada filtro devuelve solo el registro de su huésped (D) | P2 | Medio: contaminación y pruebas poco confiables |

**Datos y aislamiento.** UUID completos para nombres/apellidos; búsqueda previa, creación y comprobación posterior. La limpieza verifica propiedad antes de eliminar. Se comprueba consistencia observable; no durabilidad después de reiniciar el servicio ni unicidad global.

### 3.2 ¿Qué queda fuera de la API?

Carga, capacidad, seguridad ofensiva, recuperación del servidor y mediciones de latencia con SLO. Las duraciones HTTP adjuntas son diagnóstico funcional y no una campaña de rendimiento.

## 4. Producto B: APK My Demo App

### 4.1 ¿Cuál es el alcance funcional móvil?

**Respuesta.** La regresión Android contiene 39 combinaciones seleccionadas y reproducibles por dispositivo, más una muestra exploratoria opcional de tres compras por semilla. “Reproducible” describe los datos y la selección, no una cobertura exhaustiva de la aplicación. El barrido de las 24 referencias se añadió para caracterizar los cierres encontrados; no cubre todas las cantidades, variantes, estados ni versiones de Android. iOS queda fuera de la ejecución comprobada.

| Código | Escenario y riesgo que justifica su selección | Resultado esperado | Prioridad | Impacto del fallo |
| --- | --- | --- | --- | --- |
| MOB-01 D1/D2 | Comprar 1/2 unidades; detectar producto, cantidad o cobro incorrectos | Backpack, USD 29,99 por unidad; cantidades 1/2 y totales USD 29,99/59,98, fijados antes de ejecutar (E) | P1 | Alto: pedido e importe incorrectos |
| MOB-02 | Credenciales incorrectas; comprobar el negativo mínimo del reto | Rechazo visible y ausencia de sesión válida; no se exige permanecer en una pantalla específica (E) | P1 | Alto: incumplimiento de autenticación del ejercicio |
| MOB-03 | Back nativo de carrito a detalle/catálogo; detectar pérdida de selección | Reabrir carrito conserva nombre, cantidad, precio y total (E/D) | P1 | Alto: pérdida del estado de compra |
| MOB-04 | Eliminar el único producto; evitar pedido o total residual | Carrito vacío y sin total anterior, mediante espera por condición (D) | P1 | Alto: compra no deseada |
| MOB-06 | Usuario vacío; verificar validación del formulario | Error visible y ausencia de sesión válida (D/C) | P1 | Alto: validación de acceso inconsistente |
| MOB-07 | Scroll abajo/arriba; comprobar acceso a productos sin efectos laterales | Localizar Bike Light, regresar a Backpack y mantener carrito vacío (E/D) | P2 | Medio: catálogo no navegable |
| CAT-01 × 24 productos | Revisar las 24 referencias observadas para delimitar el fallo de apertura | La app permanece abierta y muestra nombre/precio de referencia del producto seleccionado (D) | P1 | Alto: bloqueo del recorrido antes de comprar |
| CART-01 | Aumentar a 3 y reducir a 1; detectar errores de recálculo | Cantidad y total equivalen a unidades por precio original, sin cambiar producto (D) | P1 | Alto: importe incorrecto |
| CART-02 | Disminuir la última unidad; comprobar el límite inferior del carrito | Se retira el producto y aparece carrito vacío sin total anterior (C) | P2 | Medio: estado inconsistente en el límite |
| DETAIL-01 | Cantidad cero; impedir agregar y verificar recuperación | Agregar queda deshabilitado con cero y se habilita con una unidad; carrito sigue vacío (C) | P1 | Alto: pedido con cantidad inválida |
| COLOR-01 Blue/Green | Transferir variante del detalle al carrito | Indicador conserva el color seleccionado, con el mismo producto, cantidad y precio (D) | P2 | Alto: variante distinta de la elegida |
| COLOR-02 | Pulsar indicador de color dentro del carrito | No cambia la compra: el control se caracteriza como información de solo lectura (C) | P3 | Bajo: comportamiento visual ambiguo |
| REVIEW-01 con 1/5 estrellas | Valorar y continuar; detectar modal que bloquee el recorrido | Confirmación visible, cierre del modal y regreso al producto sin agregarlo al carrito (C) | P2 | Medio: interrupción del recorrido |
| GEN-01, muestra por semilla | Comprar productos reales con cantidades generadas; ampliar combinaciones | Detalle y carrito coinciden con producto, cantidad y precio de referencia elegidos antes de actuar (D) | P2 | Medio: cobertura restringida a un ejemplo favorable |

**Implementación por funcionalidad:** [carrito](../tests/mobile/specs/cart.spec.ts), [cantidades y colores](../tests/mobile/specs/cart-interactions.spec.ts), [login](../tests/mobile/specs/login.spec.ts), [navegación](../tests/mobile/specs/navigation.spec.ts), [catálogo](../tests/mobile/specs/catalog.spec.ts), [reseñas](../tests/mobile/specs/review.spec.ts) y [compras generadas](../tests/mobile/specs/generated-cart.spec.ts).

**Datos.** El [catálogo de referencia](../tests/mobile/data/catalog-products.ts) fija 24 productos/precios desde la versión 2.3.0. La [fábrica](../tests/mobile/data/product-case.factory.ts) selecciona sin reemplazo y genera cantidades 1..3. La semilla y los datos se adjuntan. No se inventan productos ni se descartan los que fallan. Los límites técnicos de los helpers no son límites de negocio confirmados.

### 4.2 ¿Qué otros tres escenarios priorizamos?

**Respuesta.** Se documentaron y además se automatizaron estos tres.

| Extensión priorizada | Por qué se automatizó | Prioridad e impacto | Ejemplo verificable |
| --- | --- | --- | --- |
| Recálculo al modificar unidades | La repetición de operaciones puede dejar totales desactualizados; es una regla aritmética estable | P1, alto: integridad del pedido | CART-01, 1 → 3 → 1 unidades |
| Límite cero y recuperación | Detecta compra sin unidades y una acción que quede deshabilitada permanentemente | P1, alto: validez y continuidad de compra | DETAIL-01, 1 → 0 → 1 |
| Conservación de variante | Detecta una selección que se pierda al pasar del detalle al carrito | P2, alto: producto/variante incorrectos | COLOR-01, azul y verde |

Las reseñas, eliminación de última unidad, barrido de catálogo y muestra por semilla son ampliaciones adicionales. Próximos riesgos aún sin automatizar: checkout incompleto, pedido con varios productos/variantes simultáneos y recuperación tras segundo plano.

### 4.3 ¿Qué reglas móviles requieren confirmación?

1. Cambiar la fotografía al elegir un color no está exigido por el enunciado: se adjuntan imágenes y se registra la ambigüedad.
2. El catálogo admite invitado; login no es una precondición universal.
3. El checkout se describe como capacidad de la demo, pero no se presenta como compra completa ejecutada.\n