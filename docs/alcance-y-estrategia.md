# Alcance y estrategia

El reto exige automatización móvil nativa, API con Playwright Test TypeScript y uso verificable de una skill con un agente. La dedicación orientativa es de 4 a 6 horas y la sustentación de 30 minutos.

El mínimo del enunciado permite Android local; Felipe solicitó además BrowserStack con Android e iOS. Esta extensión requiere instaladores, perfiles y evidencia independientes por plataforma.

## Escenarios

| ID | Comportamiento que se valida | Expectativa |
| --- | --- | --- |
| MOB-01 | El carrito conserva el producto y la cantidad seleccionados | Nombre, cantidad, precio unitario y total coinciden con datos definidos antes de ejecutar; dos datasets independientes |
| MOB-02 | El inicio de sesión rechaza credenciales inválidas | Rechazo visible y ausencia de sesión válida |
| MOB-03 | La navegación de regreso conserva el estado esperado | Acción real del sistema y validación funcional posterior |
| API-01 | Consultar una reserva recién creada devuelve los datos registrados | Creación y consulta HTTP 200 y datos completos consistentes |
| API-02 | No se permite crear una reserva sin el nombre del huésped | Rechazo controlado sin bookingid |

La documentación de Restful Booker marca firstname como obligatorio, pero no especifica el código de error por su ausencia. Esperar 400 o 422 es nuestro criterio de calidad explícito, no una promesa del contrato. Un 500 queda fallido y se documenta.

## Priorización y ejecución

Smoke cubre creación y consulta API y, cuando esté implementado, el flujo principal del carrito. Regresión agrega negativos y navegación. Cada prueba prepara sus datos y estado, sin depender de otra ejecución. No ocultar defectos con skips o reintentos que cambien el resultado.

Priorizar después edición o eliminación de productos, campos obligatorios del checkout y fechas o tipos inválidos en reservas. Son propuestas, no casos implementados.

## Narrativa y evidencia

Los nombres expresan comportamientos del producto. Los pasos describen preparación, acción y comprobación con lenguaje de QA; no exponen selectores ni repiten fórmulas de manera mecánica. Los tags se guardan como metadatos del escenario.

Definir expectativas antes de ejecutar y conservar datos, resultado y evidencia del mismo intento. Reportes con nombres legibles no sustituyen aserciones ni ejecución real.

## IA y entrega

La skill debe incluir entradas, procedimiento, convenciones, verificación y manejo de errores. Guardarla en un commit anterior a su uso y registrar agente, modelo, invocación, cambios, ejecución observada y correcciones humanas reales.

La entrega debe incluir código y versiones, README reproducible, reportes, riesgos, tiempo invertido y tres propuestas de skills justificadas. Estas obligaciones siguen pendientes donde todavía no haya implementación o evidencia.

## Cobertura API ampliada

API-03 lista y filtra por huésped; API-04 verifica PUT mediante GET previo y posterior; API-05 verifica PATCH sin alterar otros campos; API-06 comprueba DELETE con GET 404 y búsqueda vacía; API-07 comprueba 403 y ausencia de cambios sin autorización; API-08 separa dos fixtures y sus búsquedas. Cada prueba prepara y limpia sus registros. Los UUID completos reducen colisiones y se consulta su ausencia previa; no se promete unicidad global.
