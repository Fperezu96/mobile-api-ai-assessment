---
name: mobile-native-tests
description: Implementar y revisar escenarios móviles nativos con TypeScript, WebdriverIO y Appium en este reto. Usar para carrito, autenticación y acciones del sistema; conservar aserciones de negocio, aislamiento y evidencia real.
---

# Automatizar flujos móviles nativos

## Propósito y entradas
Implementar escenarios reproducibles sobre la APK instalada, nunca sobre una web en navegador móvil. Recibir escenario, datos y expectativas previas, instalador y SHA256, plataforma, dispositivo, perfil y evidencia de elementos observados.

## Procedimiento
1. Leer AGENTS.md, docs/alcance-y-estrategia.md y configuración vigente. Comprobar versiones y disponibilidad de ADB, Java y Appium. No tocar cuentas corporativas ni secretos.
2. Conservar un commit de estas instrucciones antes de implementar el primer escenario. Registrar invocación, herramienta y modelo solo si está expuesto.
3. Inspeccionar la app mediante Appium Inspector o el árbol UI nativo. Elegir resource-id o accessibility id; usar XPath relativo solo si no hay alternativa estable. No adivinar textos, precios ni selectores.
4. Separar sesión/configuración/evidencia de Screen Objects y acciones de negocio. Inyectar pantallas en acciones. No introducir una clase base con responsabilidades ajenas.
5. Definir antes de ejecutar nombre, cantidad y precio del producto. Parametrizar carrito con dos datos distintos. Comprobar valor unitario y total, sin obtener el esperado del resultado bajo prueba.
6. Preparar estado independiente para cada caso. Resetear únicamente el paquete de la demo, no el dispositivo. Cerrar siempre la sesión. Verificar credenciales inválidas con rechazo y ausencia observable de sesión válida.
7. Usar esperas por condiciones y acciones reales del sistema para el escenario de regreso. Comprobar el estado funcional después; no basta con pulsar volver.
8. Escribir nombres, pasos y comentarios de intención en español. Mantener etiquetas como metadatos. Reutilizar Playwright Test solo para ejecución, steps, aserciones y reportes; usar WebdriverIO/Appium para toda interacción nativa.
9. Capturar pantalla y árbol UI por caso, especialmente ante fallo. Guardar logs y resultados en un directorio por ejecución, sin credenciales ni sobreescribir evidencia previa.
10. Ejecutar typecheck y los escenarios implementados. Revisar aserciones, aislamiento, importaciones, configuración y evidencia. Actualizar los tres documentos consolidados y README.

## Comandos y éxito
Usar los comandos package.json vigentes: android:local:start, appium:start, test:mobile y typecheck una vez definidos. Considerar éxito solo si los casos corrieron sobre una sesión Appium real y comprobaron el comportamiento requerido. Reportar casos no ejecutados como pendientes, nunca aprobados.

## Errores y límites
Ante fallo, conservar intento y diagnóstico; corregir preparación o implementación si la evidencia lo justifica. No reducir aserciones, forzar skips ni repetir hasta obtener verde. Si la app falla con datos válidos, registrar pasos, esperado, observado y evidencia. No compartir un mismo UDID entre procesos paralelos; asignar también puertos distintos. No declarar ejecución iOS ni nube hasta contar con instalador, sesión y resultado reales. No ejecutar AWS sin confirmar cuota gratuita de la cuenta personal.
