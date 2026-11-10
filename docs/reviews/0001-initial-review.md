# Revisión inicial de la base y del prototipo

Fecha: 10 de noviembre de 2026. Revisor: agente Codex. Revisión humana pendiente.

## Alcance

Se inspeccionó el repositorio nuevo en ffed44a y el código del prototipo externo entregado previamente como ZIP. El repositorio nuevo solo contiene configuración y documentación. Los hallazgos de implementación siguientes pertenecen al prototipo; no se afirma que estén corregidos en la solución nueva.

## Hallazgos para resolver antes de reutilizar código

| ID | Prioridad | Ubicación del prototipo | Hallazgo y efecto | Cierre esperado |
| --- | --- | --- | --- | --- |
| REV-01 | Alta | mobile/config/wdio.shared.conf.ts beforeTest y mobile/screens/base.screen.ts | Limpieza usa package Android y clearApp, selectores usan UiSelector y resource IDs. No cumple iOS. | Ciclo de app y pantallas por plataforma, comprobados en Android e iOS. |
| REV-02 | Alta | mobile/config/wdio.browserstack.conf.ts | Solo capability Android y un identificador de app, sin perfil iOS ni versión Appium comprobada en nube. | APK e IPA separados, perfiles y versiones compatibles, session ID real por plataforma. |
| REV-03 | Alta | mobile/specs/cart.spec.ts y reporters de wdio.shared.conf.ts | Títulos y llamadas técnicas sin pasos explícitos de negocio; pasos WebDriver deshabilitados. Falta documentación viva. | Reporte con precondición, acciones, expectativas, datos, resultado y evidencia por escenario. |
| REV-04 | Alta | package.json y engines de WDIO instalado | Node del PC 22.18.0 no satisface WDIO 9.33.1, que requiere al menos 22.23.4 dentro de Node 22 o 24.22.1 dentro de Node 24. | Matriz de compatibilidad y versiones justificadas antes de instalar. |
| REV-05 | Media | wdio.shared.conf.ts afterTest | Screenshot y XML sin manejo de fallo de evidencia; una sesión perdida puede añadir errores del hook al fallo original. | Preservar error original y registrar error de evidencia por separado. |
| REV-06 | Media | mobile/screens y hooks | Singletons ligados a browser global y hooks mezclando ADB, filesystem, ciclo de app y reportes. | Composición por ejecución y responsabilidades separadas donde exista variación real. |
| REV-07 | Media | scripts/run-suite.mjs | Logs y run.json se reemplazan y Allure se borra; conservar historial exige archivo manual. | Directorio por run ID con códigos de salida y evidencia histórica preservados. |

Alta significa que debe resolverse antes de reutilizar esa parte para el alcance solicitado; no es un defecto reproducido en dispositivo.

## Conservar

Expectativas definidas antes de ejecutar, dinero en centavos, cliente API separado, independencia, secretos fuera de Git y distinción entre bloqueo, fallo y aprobado. Conservar las discrepancias API sin aceptar un 500 como éxito para forzar verde.

## Base nueva

El README y la documentación distinguen lo ejecutado de lo pendiente. TypeScript está aprobado; runner y versiones no. El repositorio inicial está sincronizado y excluye secretos y resultados generados.

No se ejecutaron suites nuevas porque aún no existen ni se instalaron frameworks. Esta revisión estática no certifica ejecución Android, iOS ni compatibilidad BrowserStack.

## Revisión continua

Revisar cada diff por responsabilidad, claridad de nombres, tipos, independencia, sincronización, aserciones y manejo de evidencia. Ejecutar el control que detecte el riesgo del cambio. Revisar también el reporte resultante y su narrativa.

Compilación y lint no sustituyen la revisión de comportamiento ni la revisión humana de Felipe. Cada hallazgo debe cerrar con evidencia verificable o una aceptación explícita del riesgo.
