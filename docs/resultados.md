# Resultados y pendientes

Revisión del 10 de noviembre de 2026, PC Windows de Felipe.

## Ejecución verificable

API: 8 aprobados, 0 fallos; salida 0, 14,5 segundos en la última ejecución.

Regresión móvil: 5 aprobados, 3 fallidos, 0 omitidos; salida 1. Ejecución 2026-11-10T20-13-25-414Z, duración automática 167.9 segundos. Este tiempo no equivale a la dedicación humana acumulada.

| Caso | Resultado |
| --- | --- |
| MOB-01 D1 — El carrito conserva 1 unidad de Sauce Labs Backpack | Aprobado |
| MOB-01 D2 — El carrito conserva 2 unidades de Sauce Labs Backpack | Aprobado |
| MOB-02 — Una contraseña incorrecta impide iniciar sesión | Fallido |
| MOB-03 — Volver al catálogo conserva el contenido del carrito | Aprobado |
| MOB-04 — Eliminar el único producto deja el carrito vacío | Aprobado |
| MOB-05 — Abrir Sauce Labs Bike Light muestra su detalle sin cerrar la app | Fallido |
| MOB-05 — Abrir Sauce Labs Backpack (green) muestra su detalle sin cerrar la app | Fallido |
| MOB-06 — Un usuario vacío impide enviar el inicio de sesión | Aprobado |

El reporte está en reports/mobile/2026-11-10T20-13-25-414Z/html. Cada caso adjunta servidor Appium, sesión, captura, árbol UI y buffer de cierres Android. Los logs Appium y el registro de orquestación CI están en artifacts/android-local. El buffer Android incluye historial del dispositivo: correlacionar por hora y proceso, no atribuir todos sus eventos al test actual.

El comando test:mobile:ci se ejecutó en el PC con Appium real. Se comprobó el cierre de su servidor: verificado, /status dejó de estar disponible. La matriz API 30/33 de GitHub solo pasó revisión de configuración/YAML; no se ejecutó remotamente.

## Hallazgos conservados

### MOB-05: cierres al abrir productos

Preparación: APK My Demo App 2.3.0 build 27 y sesión limpia. Abrir la imagen de Bike Light o Backpack (green) desde el catálogo.

Esperado: detalle con el nombre y precio seleccionados, sin terminar la app.

Observado: Bike Light produce ArrayIndexOutOfBoundsException, length=6/index=6; la mochila verde produce NullPointerException al invocar Integer.intValue. Ambos apuntan a ProductCatalogFragment.java:156 en el log Android. El código público de referencia contiene fallos intencionales de demostración; se reportan como defectos conocidos de la demo, sin corregir ni modificar la APK.

Evidencia: capturas, árboles UI, logs Android adjuntos a MOB-05 y crash-bikelight-first-run.log. Los dos productos permanecen como casos de regresión fallidos, sin skips ni reintentos.

### MOB-02: contraseña incorrecta sin rechazo

Preparación: formulario de login, usuario de práctica bob@example.com y contraseña sintética incorrecta.

Esperado según el criterio del ejercicio: rechazo visible, formulario disponible y ausencia de sesión válida.

Observado: vuelve al catálogo y el menú ofrece cerrar sesión. La demo tiene autenticación permisiva; no se afirma incumplimiento de un contrato de autenticación formal ni una vulnerabilidad de un sistema real. Se conserva la discrepancia y su expectativa estricta. MOB-06 verifica por separado el rechazo documentado de usuario vacío.

## Correcciones de automatización y entorno

La primera conexión falló por ausencia de apksigner.jar. Se instalaron Build Tools 35 y se reinició Appium para actualizar su detección del SDK. El doctor del driver no había marcado ese requisito específico como obligatorio.

Se corrigió la sincronización de un título fuera de pantalla al volver. Se cambió la pulsación del control de cantidad a un gesto nativo por ID; la espera sigue exigiendo el valor exacto. Los dos datos positivos ahora usan Backpack con cantidades 1 y 2. Bike Light y la mochila verde no se eliminaron de la cobertura: se conservaron en MOB-05.

El panel de notificaciones apareció tras un cierre de la app y la búsqueda posterior sobre la pantalla del sistema; no se atribuye sin evidencia a intervención manual. El scroll ahora comprueba el paquete activo, y la preparación cierra un panel del sistema si había quedado abierto. La carrera de arranque entre suite y servidor se resolvió esperando /status.

Se conservaron todas las ejecuciones por ID, incluidas las fallidas por preparación. No son pruebas aprobadas ni se confunden con defectos nuevos de la app.

## Evidencia de IA y revisión

Instrucciones previas: .agents/skills/mobile-native-tests/SKILL.md, commit 4d786db. Se leyeron y aplicaron antes de implementar el caso de carrito.

Invocación operacional del agente: aplicar mobile-native-tests para implementar el carrito parametrizado con Screen Objects, acciones inyectadas, expectativas previas y evidencia nativa, y revisar los resultados sin ocultar fallos. No es una cita literal del usuario ni una aprobación humana.

Herramienta: Codex en ChatGPT Work, operando el PC autorizado. Modelo exacto: no expuesto de forma verificable en esta interfaz. No se inventa el identificador. Se conservaron cambios en Git, reportes y registro local artifacts/ai/native-skill-invocation.json. La revisión del agente contrastó código y ejecución; no sustituye revisión humana.

## API y contrato

Los ocho escenarios de reservas siguen juntos en bookings.spec.ts. API-02 caracteriza el 500 explícito del código público al omitir firstname y verifica ausencia de registro. La documentación exige el campo, pero no especifica ese estado de rechazo. No se clasifica como incumplimiento contractual.

Referencia: [implementación de Booker](https://github.com/mwinteringham/restful-booker/blob/619d03162c050baae7d22fdcf983a22f9da6faed/routes/index.js#L300-L321). La revisión exacta desplegada no está demostrada.

## Riesgos y pendientes

- npm audit informó 45 avisos en herramientas de desarrollo: 1 bajo, 15 moderados, 26 altos y 3 críticos. Pendiente de triage de alcance y actualización compatible; no se aplicó una corrección forzada ni una degradación automática de Appium. El servidor se limita a localhost. Informe local: artifacts/npm-audit-native.json.
- BrowserStack autentica, pero rechaza la carga con BROWSERSTACK_UNPROCESSABLE_ENTITY/422. Su guía contempla cuota agotada o restricción de detección; no se confirmó cuál aplica.
- AWS: acceso personal y minutos gratuitos no verificados. No se accedió ni modificó la cuenta del banco.
- iOS y matriz remota no ejecutados. Una ejecución Android local no demuestra compatibilidad iOS ni ejecución paralela real.
- Mediciones de rendimiento completas, actualización de la visual Archify, revisión humana, tiempo humano total y acceso del evaluador al repositorio privado pendientes.

## Preparación del fixture para varios emuladores

Typecheck aprobado con la opción deviceProfile. El descubrimiento de android-local-primary y android-local-secondary mostró 16 combinaciones: ocho escenarios por perfil, sin sesiones Appium. La selección de un nombre repetido se rechazó con salida 1 antes de iniciar pruebas. Esto valida configuración y descubrimiento; no acredita ejecución simultánea en dos emuladores.

La regresión completa indicada arriba corresponde al entorno local previamente verificado. La comprobación del fixture parametrizado sobre el perfil primario se registrará en una ejecución smoke separada, sin sustituir ni ocultar los tres fallos conocidos de la regresión.

Comprobación posterior del fixture parametrizado: 2026-11-10T20-23-42-320Z, 2 aprobados, 0 fallos, 0 omitidos; salida 0. test:mobile:ci inició y cerró su Appium; /status dejó de responder al terminar. Solo se usó android-local-primary. Los 16 escenarios descubiertos para dos perfiles no se cuentan como ejecutados ni aprobados.
