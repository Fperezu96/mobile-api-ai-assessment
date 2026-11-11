---
name: mobile-native-tests
description: Crear, ampliar y revisar pruebas Android nativas de esta evaluación con Playwright Test, WebdriverIO y Appium. Usar al pedir otro escenario de carrito, cantidades, variantes, catálogo, login, reseñas o navegación; inspeccionar UI, preservar expectativas de negocio y aportar ejecución y evidencia reales. No usar para generar pruebas web o afirmar soporte iOS inexistente.
---

# Crear una prueba móvil verificable

## Entradas y salida

Recibir objetivo de negocio, ID único, datos, resultado esperado y su fuente, perfil de dispositivo y alcance de ejecución. Si falta un dato deducible, leer el repositorio; preguntar solo cuando cambie el criterio de aceptación. Para ejecución local usar la APK verificada por apps/android-manifest.json y el perfil configurado.

Entregar un escenario mantenible en tests/mobile/specs, cambios mínimos en capas existentes, comandos de descubrimiento/ejecución y reporte revisado. Distinguir implementación, ejecución y resultado del producto. Un fallo legítimo de la APK no invalida una prueba correctamente construida.

Leer [contrato de revisión](references/review-contract.md) al preparar datos, aserciones y evidencia. Leer [guía del agente](references/agent-playbook.md) para la demostración en entrevista o al trabajar con otra herramienta.

## Procedimiento

1. Leer AGENTS.md y los tres documentos de docs. Inspeccionar package.json, fixtures, contratos, acciones, pantallas y specs relacionados antes de editar. Conservar el skill en un commit antes de utilizarlo y registrar su revisión.
2. Comparar el pedido con escenarios existentes. Evitar duplicar MOB-04 si solo se solicita eliminar. Identificar qué nueva condición aporta valor: cantidad elevada, recuperación después de eliminar, variante o estado tras volver.
3. Definir ID, comportamiento esperado, prioridad y fuente: requisito explícito, expectativa derivada o caracterización. No convertir un límite del helper (1..99) en regla de negocio ni considerar correcta una respuesta solo porque se observó una vez.
4. Inspeccionar la app con Inspector o árbol UI de una sesión Appium. Reutilizar locators comprobados; preferir resource-id o accessibility id. No inventar selectores, precios o soporte iOS. Si el MCP necesario no está disponible, indicar la limitación sin fingir interacción.
5. Separar modelos de datos, contratos de comportamiento, screens por pantalla, componentes compartidos y acciones de negocio. Inyectar dependencias; no crear una clase universal ni duplicar todas las pantallas por plataforma. Compartir solo comportamiento comprobado.
6. Preparar estado aislado mediante native.fixture.ts. Usar WebdriverIO como cliente W3C de Appium; UiAutomator2 ejecuta en Android. Playwright Test aporta runner, fixtures, expect, steps y reportes, nunca page ni un navegador para estos casos.
7. Fijar expectativas antes de actuar. Usar precios en centavos y multiplicación independiente de cantidades; no tomar el total mostrado como oráculo. Elegir productos del catálogo real. Una semilla selecciona productos existentes sin reemplazo; no fabrica productos que la APK no contiene.
8. Escribir títulos y pasos profesionales en español: preparación observable, acción de negocio y comprobación concreta. Usar step del fixture, no envolver bloques técnicos sin valor. Mantener tags como metadatos. Evitar sleeps y esperas arbitrarias.
9. Verificar estado antes y después de eliminar, cambiar cantidad, volver o enviar una reseña. Para rechazo de login comprobar ausencia de sesión válida. No inferir persistencia remota desde un modal de confirmación ni inventar que la fotografía debe cambiar al tocar un indicador.
10. Conservar errores y adjuntos del fixture. Si la app se cierra, recoger captura, UI fresca y log del PID/intervalo. No marcar skip, expected failure, ni suavizar la expectativa para obtener verde. Distinguir cierre, bloqueo de UI, timeout del test y fallo de adquisición.
11. Ejecutar typecheck y descubrimiento por ID antes de crear la sesión. Ejecutar solo el escenario afectado, revisar reporte y error original. Detenerse tras una reproducción válida; repetir únicamente ante una corrección o duda concreta, conservando ambos intentos.
12. Actualizar alcance/resultados si se agregó cobertura. Registrar skill/commit previo, petición, archivos, comandos, runId, resultado, herramienta/modelo realmente expuesto y correcciones humanas. No inventar ahorros de tiempo, autoría, aprobaciones ni un modelo exacto.

## Selección y ejecución

Consultar scripts actuales en package.json. Descubrir con:
~~~powershell
npm run typecheck
npm run test:mobile -- --list --grep "CART-03"
~~~
Con el dispositivo listo, usar una terminal para appium:start y otra para:
~~~powershell
npm run test:mobile -- --grep "CART-03"
npm run report:mobile
~~~

Agregar @mobile y un tag funcional. Agregar @regression cuando deba entrar en la regresión determinista; @smoke solo para un recorrido breve y crítico. Para una demostración adicional usar @interview y selección explícita. @known-issue documenta un defecto, no cambia el resultado. Validar que --grep selecciona únicamente lo solicitado.

## Límites de entorno y aprendizaje

- Un UDID admite una sola prueba/Inspector activo. Paralelismo requiere perfiles y puertos internos distintos; no aumentar workers sobre un único dispositivo.
- La demo bloquea UI unos 5 s al eliminar. Usar espera por condición de hasta 10 s, conservar el hallazgo de rendimiento y no llamarlo ANR sin evidencia.
- No filtrar del muestreo los productos que crashean ni convertir su cierre en aprobación.
- Si se pide “60 productos”, distinguir 60 unidades de un producto de 60 referencias distintas: el catálogo observado tiene 24 referencias. Una cantidad alta puede requerir muchas pulsaciones y un presupuesto medido; no subir timeouts sin justificarlo.
- No usar BrowserStack/AWS ni comprar cuota para esta entrega. GitHub Actions puede ejecutar Android mediante el workflow del repositorio. iOS exige instalador y adaptación real; BrowserStack no está integrado al fixture de regresión. No acceder a cuentas AWS corporativas.
- Un MCP permite leer/editar archivos o controlar una sesión; no ejecuta automáticamente este skill. El agente debe poder leer estas instrucciones y disponer de las herramientas necesarias. No prometer compatibilidad universal.
