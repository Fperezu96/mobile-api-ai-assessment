# Resultados y pendientes

Revisión del 10 de noviembre de 2026. Resultados del repositorio actual en Windows.

## Cobertura API ejecutada

La ejecución anterior tuvo siete aprobados y un fallo por exigir 400/422 sin respaldo contractual. Se conserva su evidencia histórica. La expectativa se corrigió al HTTP 500 implementado y se agregó una búsqueda posterior para comprobar que no se crea la reserva. Nueva ejecución: ocho escenarios aprobados, cero fallos y cero omitidos en 9,1 segundos; salida 0. Typecheck aprobado.

| ID | Comprobación | Resultado |
| --- | --- | --- |
| API-01 | Crear y consultar una reserva conserva sus datos | Aprobado |
| API-02 | Omitir firstname obtiene HTTP 500 y no crea una reserva | Aprobado |
| API-03 | Listado y búsqueda por huésped encuentran el registro | Aprobado |
| API-04 | PUT guarda los nuevos datos y GET los recupera | Aprobado |
| API-05 | PATCH cambia una preferencia y conserva los demás campos | Aprobado |
| API-06 | DELETE elimina un registro existente; GET devuelve 404 y la búsqueda queda vacía | Aprobado |
| API-07 | PUT sin autorización devuelve 403 y no modifica el registro | Aprobado |
| API-08 | Dos fixtures distintos generan registros e IDs separados y filtros precisos | Aprobado |

Typecheck aprobado. Los resultados incluyen limpieza autenticada de reservas propias y verificación de que dejan de estar disponibles. Solo se eliminan IDs creados por la prueba cuya identidad de huésped sigue coincidiendo; si el servicio reutilizó el ID, la limpieza se omite y se anota.

## Explicación del HTTP 500

El código público de Restful Booker, revisión 619d03162c050baae7d22fdcf983a22f9da6faed, valida la presencia de firstname. En POST /booking, si el validador devuelve errores, la ruta responde explícitamente con res.sendStatus(500). No hace falta una excepción del servidor para producir el resultado observado.

[Implementación consultada](https://github.com/mwinteringham/restful-booker/blob/619d03162c050baae7d22fdcf983a22f9da6faed/routes/index.js#L300-L321) y [reglas de validación](https://github.com/mwinteringham/restful-booker/blob/619d03162c050baae7d22fdcf983a22f9da6faed/helpers/validationrules.js).

La documentación declara el campo obligatorio, pero no promete 400 ni 422 para su ausencia. Nuestra petición negativa está construida correctamente. El HTTP 500 está implementado explícitamente y se caracteriza como comportamiento existente, no como defecto contractual. Recomendar un 4xx para entradas inválidas es una observación de diseño no bloqueante. El código público explica el comportamiento, pero no prueba cuál revisión exacta está desplegada.

## Qué demuestra la persistencia

Cada actualización y eliminación empieza creando y consultando su propia reserva. Después se realiza la operación y se comprueba el estado mediante otra consulta HTTP. No se depende de la respuesta de PUT o DELETE ni de la ejecución de otro test.

Los fixtures usan UUID completos y consultan por firstname y lastname antes de crear. Después se verifica el ID esperado y la ausencia de registros adicionales para ese huésped. Esto comprueba aislamiento de los datos de la prueba; no garantiza unicidad global ante todas las peticiones concurrentes del servicio público.

Las comprobaciones demuestran consistencia observable por API, no durabilidad de almacenamiento tras reiniciar el servidor.

## BrowserStack

App Automate devolvió HTTP 200 al autenticar y listar dispositivos. El plan consultado figura Free, con cero sesiones activas y hasta cinco en paralelo. Esa respuesta no indica los minutos gratuitos restantes.

El APK My Demo App 2.3.0 build 27 coincide con el SHA256 fijado. La carga desde archivo y desde URL oficial devolvió HTTP 422 con BROWSERSTACK_UNPROCESSABLE_ENTITY. La respuesta es de BrowserStack, antes de crear una sesión; no es una respuesta de la app ni de Appium.

[La guía oficial para ese error](https://www.browserstack.com/support/faq/app-automate/common-errors/browserstack_unprocessable_entity-error-during-app-upload) enumera minutos gratuitos agotados para la app o una marca de su sistema de detección de abuso. No se ha confirmado cuál aplica a esta cuenta.

Siguiente paso: revisar consumo y disponibilidad de App Automate en el panel. Si los minutos se agotaron, resolver el acceso con el evaluador o decidir un plan. Si existe cuota, solicitar a soporte que revise la restricción usando código, hora del intento, versión y SHA256 del APK, sin enviar credenciales. No se compró un plan ni se contactó soporte. No insistir con cargas idénticas ni modificar el APK para eludir la restricción.

Aún no existe session ID ni ejecución móvil aprobada. iOS sigue pendiente de IPA y configuración. Android local puede permitir continuar el mínimo del reto mientras se resuelve la nube, sin dar por completado BrowserStack.

## Otros pendientes

Archify generó el HTML y pasó controles de estructura; browser-check sigue bloqueado por la conexión Chrome desde un proceso elevado. La limitación permanece en los recibos y en arquitectura.

Faltan implementación móvil con skill previa, revisión humana, identificación exacta del modelo, propuestas de skills, pipeline y sustentación. El acceso del evaluador al repositorio privado no se ha concedido. No se inventa tiempo de dedicación humana a partir de la duración de comandos.
