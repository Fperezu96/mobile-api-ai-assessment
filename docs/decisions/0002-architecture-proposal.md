# ADR 0002 Arquitectura y documentación viva

Estado: propuesta para revisión con Felipe. No autoriza instalar dependencias ni trasladar el prototipo sin revisar compatibilidad.

## Objetivo

Mantener las intenciones de negocio legibles y ejecutar los mismos comportamientos relevantes en Android e iOS, con diferencias técnicas explícitas. Aplicar separación de responsabilidades útil para un framework de pruebas; no reproducir por ceremonia todas las capas de una aplicación de producción.

## Capas propuestas

| Capa | Responsabilidad | Evitar |
| --- | --- | --- |
| Escenarios | Precondición, acción, expectativa y ejemplos de negocio | IDs UI, capabilities y comandos ADB |
| Steps o casos | Enlazar narrativa con acciones y verificaciones | Duplicar flujos por plataforma |
| Acciones y verificaciones de negocio | Agregar producto, consultar carrito y comprobar compra | Importar implementaciones Android directamente |
| Pantallas y clientes | Interactuar con UI o endpoints y devolver datos tipados | Afirmar el resultado de negocio dentro de una acción técnica |
| Infraestructura | Sesión, perfiles, datos, sincronización, evidencia y reportes | Decidir qué defecto debe aprobarse |

La dependencia de acciones hacia pantallas se hará mediante contratos pequeños cuando Android e iOS tengan implementaciones diferentes. La composición de la ejecución elegirá esas implementaciones y el ciclo de estado apropiado. Mantener API independiente de la app demo.

## SOLID con aplicaciones concretas

| Principio | Aplicación propuesta | Cómo revisar |
| --- | --- | --- |
| S responsabilidad única | Separar captura de evidencia, ciclo de app y lectura del carrito | Un cambio de reporte no exige modificar navegación |
| O abierto a extensión | Añadir un perfil o implementación iOS respetando los contratos | El escenario de negocio compartido conserva su intención |
| L sustitución | Android e iOS devuelven el mismo significado de CartSnapshot | Mismas expectativas aplicables y errores claros si falta capacidad |
| I interfaces pequeñas | Contratos por capacidades como catálogo, carrito o autenticación | No obligar a una pantalla a implementar funciones que no necesita |
| D inversión de dependencias | Acciones reciben los colaboradores de la ejecución | No importan singletons concretos ni construyen el driver |

La inyección de dependencias es una técnica que ayuda a D; la I corresponde a segregación de interfaces. No crear una interfaz para cada clase si no aporta sustitución o claridad.

## Clean Code y separación de capas

Nombres del negocio para escenarios y acciones; nombres técnicos dentro de adaptadores. Evitar BaseScreen con responsabilidades crecientes, valores mágicos, pausas fijas, datos compartidos y catches que oculten errores. Validar configuración en el límite y conservar fallos originales.

La propuesta toma separación de políticas e infraestructura de Clean Architecture. No se afirmará que cumple una arquitectura completa hasta revisar las dependencias efectivas del código. Evitar una capa de repositorio artificial para cada endpoint.

## Documentación viva propuesta

Candidato móvil: Gherkin en español con Cucumber y TypeScript sobre WebdriverIO y Appium. Permite escenarios y ejemplos de negocio visibles en reportes. Costo: añadir runner BDD e integración de reportes y mantener steps con disciplina, sin convertir cada clic en un paso.

Alternativa: Mocha con pasos de reporte explícitos. Reduce configuración BDD, pero exige construir y revisar la narrativa de negocio. Serenity JS es otra alternativa a evaluar por compatibilidad y capacidades nativas; no es equivalente automáticamente a Serenity BDD Java.

API conserva Playwright Test con test.step para intención y expectativas, sin sustituirlo por otro runner ni duplicar la misma prueba en dos runners.

Ejemplo de narrativa móvil propuesta:

```gherkin
# language: es
@MOB-01 @smoke
Característica: Carrito de compras
  Esquema del escenario: Conservar el producto elegido y calcular su total
    Dado que el catálogo está disponible y el carrito está vacío
    Cuando agrego <cantidad> unidades de "<producto>" al carrito
    Entonces el carrito contiene ese producto con el precio unitario esperado
    Y el total corresponde a la cantidad y al precio definidos
```

Es solo un ejemplo de estructura, todavía no una feature implementada. Antes de ejecutar se deberán añadir ejemplos con precios y resultados exactos; los steps no deberán calcular el esperado a partir del mismo valor observado.

## Decisiones pendientes antes del código

1. Seleccionar Mocha con pasos o Cucumber, comparando un reporte mínimo.
2. Validar la matriz Node, runner, Appium, drivers y reportes contra local y BrowserStack.
3. Fijar apps equivalentes Android e iOS y sus diferencias funcionales.
4. Definir aislamiento y recuperación por plataforma, sin asumir que clearApp Android funciona en iOS.
5. Definir nombres, tags y evidencia por run ID, plataforma, requisito y caso.

## Criterio de salida

Felipe puede explicar la separación y los costos con ejemplos. Las versiones son compatibles y están justificadas. Un recorrido mínimo demuestra sesión Android e iOS y reporte con pasos legibles antes de ampliar la suite.
