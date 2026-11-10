# Etapas y criterios de salida

Cada etapa produce un resultado revisable antes de ampliar la implementación.

| Etapa | Entregable | Criterio de salida |
| --- | --- | --- |
| 1 Repositorio | Carpeta local, README, Git y remoto privado | Primer commit sincronizado y árbol de trabajo limpio |
| 2 Requisitos y planeación | Matriz, escenarios, prioridades, oráculos y datos | Alcance mínimo y extensión Android iOS diferenciados |
| 3 Arquitectura | Diagrama, responsabilidades, convenciones y decisiones | SOLID y separación de capas explicados con ejemplos concretos |
| 4 Compatibilidad y entorno | Matriz de versiones y decisiones justificadas | Node, runner, Appium, drivers, BDD y reportes compatibles con local y BrowserStack |
| 5 Prueba de conexión | APK e IPA fijados y sesión por plataforma | Android local y sesiones Android iOS en App Automate verificadas |
| 6 Skill y primer escenario | Skill previa y primer flujo con pasos de negocio | Commit previo, uso del agente y revisión humana |
| 7 Suites y refinamiento | Mobile y API, smoke y regresión | Ejecuciones reales, fallos analizados y aserciones conservadas |
| 8 Pipeline y documentación viva | Comandos, jobs, reportes y trazabilidad | Resultados legibles de negocio, evidencia y estados honestos |
| 9 Entrega y sustentación | Riesgos, pendientes y guion de demostración | Acceso del evaluador y ejecución reproducible |

## Convenciones por definir en arquitectura

Nombres de escenarios y steps, idioma de negocio, etiquetas por requisito y nivel de suite, composición de acciones, Screen Objects por plataforma, tratamiento de datos, política de evidencias y ubicación de artefactos.

## Criterio de documentación viva

Un lector debe poder identificar precondición, acción, resultado esperado y resultado observado sin leer selectores. Los reportes deberán mostrar los pasos y datos de negocio y enlazar evidencia de esa ejecución. Tener un nombre descriptivo o un HTML por sí solos no demuestra este criterio.
