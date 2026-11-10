# Acuerdos de trabajo

## Alcance y estado

TypeScript para móvil y API. Playwright Test para API y WebdriverIO con Appium para aplicaciones nativas. Incluir Android local y Android e iOS en BrowserStack. La API y Android local están implementados y ejecutados. La regresión móvil conserva fallos de la demo; BrowserStack sigue bloqueado en la carga y no hay ejecución iOS ni nube aprobada.

## Diseño y revisión

Aplicar SOLID, Clean Code y separación de responsabilidades con ejemplos concretos. No crear capas artificiales ni afirmar que se cumple Clean Architecture completa sin revisar las dependencias reales.

Mantener separados escenarios, acciones de negocio, pantallas, clientes API, sesión y evidencia. No asumir que IDs o limpieza Android funcionan en iOS. Justificar versiones con el entorno del PC y el servidor de BrowserStack; evitar cambios globales innecesarios.

Revisar el código y el reporte de cada incremento. Los controles estáticos no sustituyen ejecución real ni revisión humana.

## Lenguaje y documentación viva

Escribir comentarios en español que expliquen motivos o decisiones, sin narrar operaciones obvias. Conservar nombres oficiales de APIs, librerías y comandos.

Los escenarios deben describir comportamientos con lenguaje profesional y natural de QA. Los pasos explican preparación, acción y comprobación; evitar fórmulas rígidas, títulos inflados y selectores técnicos. Guardar etiquetas como metadatos.

Mantener el README como guía de instalación, comandos y estado. Consolidar conclusiones en docs/alcance-y-estrategia.md, docs/arquitectura.md y docs/resultados.md. Actualizar esos documentos en lugar de crear informes por cada avance. El historial vive en Git.

## Evidencia y privacidad

Guardar la skill en un commit antes de usarla con el agente. Conservar invocación, cambios, resultados, modelo y correcciones humanas reales. No inventar aprobaciones, debilitar aserciones ni ocultar errores.

No versionar credenciales, instaladores ni resultados generados. Conservar el fallo original y la evidencia por ejecución. Autenticación válida o carpeta creada no significan prueba funcional aprobada.
