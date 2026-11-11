# Guía del agente y demostración

## Invocar desde Codex

Abrir el repositorio y solicitar:
~~~text
Usa $mobile-native-tests para crear CART-03: agregar una unidad de Backpack,
eliminarla, comprobar carrito vacío y sin total, volver al catálogo y agregar
dos unidades del mismo producto. Verificar nombre, cantidad y total esperado.
Usar @mobile @interview @cart. Inspeccionar las capas existentes, ejecutar
typecheck y descubrimiento, y después el caso en Android local.
Conservar el reporte si la app falla. No usar servicios cloud.
~~~

Si el agente no reconoce el nombre, indicarle leer
.agents/skills/mobile-native-tests/SKILL.md y sus referencias desde la raíz.
El archivo es portable; registro y sintaxis dependen del agente.
agents/openai.yaml aporta metadatos para herramientas compatibles:
no crea un subagente ni instala un MCP.

## Solicitar cantidad alta

“60 unidades de Backpack, precio unitario USD 29,99, total esperado
USD 1799,40; verificar cantidad e importe y luego vaciar el carrito”.
Pedir primero confirmar el alcance y presupuesto de acciones.
No confundir 60 unidades con 60 referencias distintas: hay 24 referencias
observadas. El rango 1..99 del helper no prueba un límite de negocio.

## Separar herramienta y agente

El agente interpreta el pedido y revisa el cambio. Desktop Commander u otro
MCP de archivos/terminal permite trabajar sobre el PC autorizado.
Inspector o una herramienta de sesión nativa permite observar elementos.
WebdriverIO es la biblioteca cliente de Appium, no un emulador o MCP.
No asumir que una herramienta está disponible por nombrarla.

El comando npm run skill:prompt -- --id CART-03 --scenario "..."
imprime una petición para pegar en el agente. No llama a un modelo,
no genera código por sí solo y no abre sesiones.

## Evaluar el resultado

Aplicar references/review-contract.md. Explicar qué se reutilizó,
qué esperado se fijó y dónde consultar evidencia. Sin dispositivo,
dejar explícita la ejecución pendiente. Si falla la APK, conservar el fallo
y su clasificación. No sustituir aceptación humana por un reporte verde.
