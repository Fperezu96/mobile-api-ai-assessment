# API ejecución y reportes

Ejecutar en PowerShell desde C:\dev\mobile-api-ai-assessment:

```powershell
npm.cmd ci
npm.cmd run typecheck
npm.cmd run test:api:smoke
npm.cmd run test:api
npm.cmd run report:api
```

Smoke ejecuta API-01; la suite completa incluye API-02. Salida 0 indica pruebas aprobadas y 1 indica fallo; inspeccionar reporte para distinguir infraestructura de discrepancia del producto. El HTTP 500 por firstname ausente es un fallo respecto del criterio definido y no se oculta.

HTML en reports/api/html, JUnit en reports/api/junit.xml y JSON en reports/api/results.json. Steps reflejan precondición, acción y expectativa. Adjuntos identifican datos esperados y respuestas. Los resultados generados no se suben a Git.

No hay limpieza autenticada implementada: las reservas son sintéticas, quedan identificadas en anotaciones y pueden persistir hasta el reinicio del servicio público.

BrowserStack: copiar .env.example a .env y completar credenciales localmente. Ejecutar npm.cmd run browserstack:check. Salida 2 significa configuración incompleta; no es conexión exitosa.
