# Contrato de revisión

## Antes de implementar
- Identificar ID sin duplicados, objetivo, datos, esperado y fuente.
- Revisar casos relacionados y reutilizar contratos, acciones y screens.
- Definir precios en centavos desde datos previos, nunca desde el total observado.
- Separar requisito explícito, expectativa derivada y caracterización.

## Antes de ejecutar
- Typecheck correcto y descubrimiento por ID sin duplicados.
- Tags en metadatos, pasos de negocio, datos reproducibles e imports .js.
- Sesión aislada, dispositivo libre, Appium listo y checksum APK válido.
- Sin secretos, sleeps, skips ni aserciones debilitadas para obtener verde.
- Cantidad alta: comprobar alcance, pulsaciones y presupuesto de ejecución.
- Eliminación: exigir estado vacío y ausencia del total previo.

## Revisar el reporte
- Mantener esperado/obtenido, error original y pasos legibles.
- Correlacionar captura, árbol UI fresco y log del PID/intervalo si hay cierre.
- Distinguir defecto de producto, automatización y entorno con evidencia.
- No fusionar reruns ni presentar descubrimiento como ejecución.
- No inferir persistencia remota desde una confirmación UI.

## Entrega mínima
Petición; skill y commit previo; archivos; comandos; runId; resultado;
evidencias; límites; correcciones y revisión humana realizada o pendiente.
