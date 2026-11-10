# Alcance y estrategia

El reto exige app instalada, Page/Screen Objects, API con Playwright Test TypeScript, dos conjuntos de datos móviles, una skill usada por un agente y evidencia verificable. Android local cumple el mínimo; iOS y nube son extensiones solicitadas por Felipe.

## Cobertura vigente

| Escenario | Comprobación | Etiquetas |
| --- | --- | --- |
| MOB-01 D1/D2 | Una y dos unidades de Backpack: nombre, cantidad, precio unitario y total | smoke, regression, cart |
| MOB-02 | Contraseña incorrecta: rechazo visible y ausencia de sesión válida | regression, login |
| MOB-03 | Volver con Android Back hasta el catálogo y comprobar que el carrito conserva sus datos | regression, navigation |
| MOB-04 | Eliminar el único producto y comprobar estado vacío | regression, cart |
| MOB-05, dos productos | Abrir Bike Light y Backpack (green) debe mostrar el detalle sin cerrar la app | regression, known-issue |
| MOB-06 | Usuario vacío: validación visible y ausencia de sesión válida | regression, login |
| API-01 a API-08 | Crear, consultar, listar, filtrar, PUT, PATCH, DELETE, autorización y aislamiento | smoke, regression, crud, authorization, isolation, characterization |

MOB-01 fija antes de ejecutar USD 29,99 por unidad, cantidades 1/2 y totales USD 29,99/59,98. Los productos que provocaron cierres permanecen en MOB-05: cambiar los datos del caso positivo no eliminó su comprobación ni sus fallos.

MOB-06 comprueba un rechazo definido por el formulario. MOB-02 conserva una expectativa de contraseña incorrecta frente al criterio del reto; la demo tiene un login permisivo, por lo que se distingue esa limitación de un contrato de autenticación formal inexistente.

La API es independiente de la demo. La documentación de Booker exige firstname, pero no especifica su código de rechazo. API-02 caracteriza el HTTP 500 implementado y comprueba ausencia de reserva; recomendar 4xx queda como observación de diseño no bloqueante.

## Datos, aislamiento y revisión

Una sesión Appium nueva por prueba, noReset=false y cierre garantizado. Antes del escenario se desbloquea el dispositivo y, si quedó abierto, se cierra el panel de notificaciones. No se comparte el UDID entre workers. Las esperas dependen de condiciones; el scroll verifica que la app permanezca en primer plano antes de actuar.

Los fixtures API usan UUID completos y consultas previas/posteriores. La limpieza comprueba que cada registro sigue perteneciendo al test antes de eliminarlo. Esto verifica consistencia observable y aislamiento, no durabilidad tras reinicios ni unicidad global.

No hay skips ni reintentos automáticos para disimular fallos. Se conservan también intentos con problemas de entorno o sincronización, diferenciándolos de los hallazgos de la app.

## Tres siguientes casos por riesgo

1. Checkout con campos obligatorios ausentes: evita avanzar con datos incompletos en un flujo comercial.
2. Límites de cantidad y recálculo al reducir unidades: comprueba cero, límites admitidos y coherencia del importe.
3. Segundo plano y recuperación de la app: comprueba continuidad del carrito y que no se habilite una sesión inesperada.

El complemento no funcional medirá arranque, memoria y fluidez con condiciones y muestras documentadas. Todavía no es una campaña ejecutada. Lighthouse y Web Vitals solo aplicarán si se incluye contenido web pertinente; no miden estas pantallas nativas.

## IA y adopción

Las instrucciones de implementación están en .agents/skills/mobile-native-tests/SKILL.md, conservadas antes del primer escenario móvil en 4d786db. La invocación, la revisión del agente y sus correcciones se documentan en resultados. No se registra una aprobación humana inexistente.

| Propuesta | Usuario, entradas y salida | Verificación y prioridad |
| --- | --- | --- |
| Triage de fallos móviles | QA; recibe reporte, logs, capturas y árbol UI; entrega diagnóstico con evidencia y clasificación app/automatización/entorno | Contrastar con reproducción y revisión humana, sin debilitar aserciones. P1 |
| Revisión de matriz de dispositivos | QA/DevOps; recibe compatibilidad, cuota y capacidad; entrega matriz acotada con aislamiento de sesiones y puertos | Comprobar arranque y reportes por dispositivo. P2 |
| Preparación de entrega QA | QA/lead; recibe resultados, versiones, riesgos y enlaces; actualiza los documentos consolidados | Comprobar cada afirmación contra una evidencia real. P2 |

Construir primero el triage: este ejercicio ya muestra cierres de la app, un login permisivo y errores de preparación distintos. Medir tiempo de diagnóstico y coincidencia de clasificación con revisión humana antes/después, sin inventar una mejora porcentual. Descargas con checksum, extracción de estadísticas y validación de puertos deben seguir siendo scripts deterministas, no nuevas skills.
