# Resultados y pendientes

Última revisión: 10 de noviembre de 2026. Resultados del repositorio actual en el PC; no se mezclan con el prototipo anterior.

## Ejecuciones

| Comprobación | Resultado observado | Evidencia |
| --- | --- | --- |
| Compilación TypeScript | Aprobada, salida 0 | npm run typecheck |
| API-01 Crear y consultar | Aprobada | Reporte Playwright con datos y respuestas |
| API-02 Nombre obligatorio ausente | Fallida; HTTP 500 | Reporte, JSON, JUnit y traza |
| Acceso a App Automate | HTTP 200 | artifacts/browserstack/connection.json |
| Consulta de dispositivos | Respondió y anunció Google Pixel 7 Android 13 | Resultado de comprobación de conexión |
| Carga del APK desde archivo | HTTP 422, error interno BrowserStack | Directorios por intento en artifacts/browserstack |
| Carga desde URL oficial | Mismo HTTP 422 | Intento registrado por separado |
| Sesión Android | No creada por fallo de carga | No hay session ID ni captura nativa |
| iOS | No ejecutado | Falta IPA y configuración |
| Archify | HTML generado; comprobación Chrome bloqueada | Recibos junto al HTML |

## Hallazgo API

Al enviar una reserva sin firstname, el servicio devuelve 500 con Internal Server Error. Esperamos rechazo controlado 400 o 422 y ausencia de reserva creada. El campo es obligatorio en la documentación; el estado de error no está definido allí. Se conserva el caso fallido.

Las reservas positivas usan datos sintéticos y su ID aparece en anotaciones. No hay limpieza autenticada implementada y pueden permanecer hasta el reinicio del servicio.

## Bloqueo BrowserStack

El APK oficial My Demo App 2.3.0 build 27 se descargó y su SHA256 coincide con el manifiesto. BrowserStack respondió BROWSERSTACK_UNPROCESSABLE_ENTITY por razones internas al intentar cargarlo tanto desde archivo como por URL pública. Autenticación correcta no equivale a instalador aceptado ni sesión creada.

El siguiente paso es contrastar la carga manual del mismo APK en App Automate o resolver el rechazo del proveedor. No se cambió de app para ocultar el bloqueo y no se contactó soporte. No hay evidencia móvil que pueda declararse aprobada.

## Pendientes de aceptación

Resolver la carga Android y crear una sesión; fijar configuración Appium y dispositivo; implementar y revisar el primer flujo mediante skill guardada previamente. Después completar negativos y navegación, obtener IPA para iOS y validar ambas plataformas.

Completar revisión humana, etiqueta exacta de modelo, evidencia de IA, propuestas de skills, pipeline y sustentación. El repositorio privado existe; el acceso del evaluador todavía no se ha concedido.

El presupuesto del enunciado es de 4 a 6 horas. El tiempo total de dedicación humana no está medido y no se inventa a partir del tiempo de los comandos.
