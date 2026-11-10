# Automatización móvil y API

Proyecto de Felipe Pérez Upegui para validar una aplicación móvil nativa y una API independiente, con escenarios legibles, código mantenible y evidencia de ejecución.

## Estado actual

La base API está implementada y se ejecutó en Windows. Crear y consultar una reserva aprobó; omitir el nombre del huésped devolvió HTTP 500 y mantiene el caso negativo fallido. BrowserStack reconoce la cuenta y permite consultar dispositivos, pero rechazó la carga del APK con HTTP 422 tanto desde archivo como desde su URL oficial. Todavía no hay sesión móvil ni pruebas Android o iOS ejecutadas.

La estructura móvil está preparada para WebdriverIO y Appium. Los contratos, acciones y Screen Objects se implementarán después de resolver la carga del instalador y revisar el primer flujo. El prototipo anterior sirve de referencia, no de evidencia de esta base.

## Preparar y ejecutar

Requisitos comprobados: Node 22.18.0 y npm 10.9.3 en Windows. Las dependencias están fijadas en package-lock.json; no hace falta cambiar Node global ni descargar navegadores para las pruebas API.

```powershell
Set-Location C:\dev\mobile-api-ai-assessment
npm.cmd ci
npm.cmd run typecheck
npm.cmd run test:api:smoke
npm.cmd run test:api
npm.cmd run report:api
```

Smoke ejecuta el escenario positivo. La suite completa agrega el negativo y termina con salida 1 si reproduce el HTTP 500 documentado. El reporte muestra los pasos de negocio, datos y respuestas.

## Conectar BrowserStack

Copiar .env.example a .env si todavía no existe y completar BROWSERSTACK_USERNAME y BROWSERSTACK_ACCESS_KEY únicamente en el archivo local.

```powershell
npm.cmd run browserstack:check
npm.cmd run app:download
npm.cmd run browserstack:android:connect
```

La conexión comprueba acceso a App Automate. El segundo comando descarga el APK oficial y valida su SHA256. El tercero intenta cargar la app y abrir el catálogo en un dispositivo Android real. Es una comprobación de entorno; no valida el carrito ni reemplaza los escenarios funcionales. La alternativa de carga desde URL es `npm.cmd run browserstack:android:connect -- --public-url`; también devolvió HTTP 422 en la ejecución registrada.

## Reportes y evidencia

- API: reports/api/html, reports/api/results.json y reports/api/junit.xml.
- BrowserStack: artifacts/browserstack, con un directorio por intento y resultado sin credenciales.
- Arquitectura: [visual Archify](.archify/architecture-mobile-api-20261110-132500/arquitectura.html). Descargar o abrir el HTML localmente; GitHub muestra su código.

La validación automática de Archify en Chrome está pendiente por el contexto elevado de ejecución. El HTML se generó y pasó sus controles de estructura, pero no se presenta como validación completa.

## Documentación del proyecto

- [Alcance y estrategia](docs/alcance-y-estrategia.md): requisitos, escenarios y criterios.
- [Arquitectura](docs/arquitectura.md): estructura, versiones, decisiones y revisión de código.
- [Resultados](docs/resultados.md): ejecuciones, hallazgos, bloqueos y siguiente paso.

Estos documentos se actualizan con las conclusiones vigentes. Las decisiones anteriores se consultan en Git; no se crea un informe nuevo por cada avance.

## Repositorio y trabajo

[GitHub privado](https://github.com/Fperezu96/mobile-api-ai-assessment). Carpeta local: C:\dev\mobile-api-ai-assessment. Trabajar en ramas pequeñas, revisar código y reporte antes de integrar y mantener comentarios en español que expliquen motivos.

Los secretos, instaladores y resultados generados están excluidos de Git. Para la sustentación, la skill deberá guardarse antes de usarla en el primer escenario móvil y se conservarán invocación, cambios y revisión humana.
