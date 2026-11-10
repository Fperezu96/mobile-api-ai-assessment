# Alcance y requisitos

Fuente principal: Prueba_Tecnica_Automatizacion_Mobile_IA.docx proporcionada por Felipe. Dedicación orientativa de 4 a 6 horas y sustentación de 30 minutos.

## Mínimo del enunciado

| ID | Necesidad | Evidencia esperada |
| --- | --- | --- |
| MOB-01 | Agregar producto al carrito y validar nombre, cantidad y precio | Ejecución nativa y aserciones de negocio |
| MOB-02 | Credenciales inválidas rechazadas sin sesión válida | Estado posterior, mensaje y evidencia |
| MOB-03 | Scroll o acción del sistema con validación funcional posterior | Acción real y estado comprobado |
| DATA-01 | Parametrizar un escenario móvil con dos datasets | Casos independientes y expectativas previas |
| API-01 | Crear y consultar una reserva | HTTP y datos relevantes |
| API-02 | Rechazar dato obligatorio ausente o inválido | Expectativa explícita y discrepancias documentadas |
| DESIGN-01 | Screen Objects, clientes API y sincronización estable | Código organizado e independiente |
| AI-01 | Skill implementada y utilizada para un caso exitoso | Commit previo, invocación, cambios, ejecución y revisión |
| AI-02 | Tres propuestas adicionales de skills | Necesidad, entradas, salidas, verificación y prioridad |
| DOC-01 | Reproducibilidad, reportes, riesgos y evidencias | README, comandos, versiones y resultados reales |
| DEMO-01 | Ejecutar móvil y variar un caso con agente | Sustentación reproducible |

## Alcance adicional solicitado por Felipe

BrowserStack se utilizará para Android e iOS. El enunciado permite Android local y hace opcionales iOS y BrowserStack; la cobertura de ambas plataformas es una decisión explícita del proyecto solicitada por Felipe.

También se revisarán arquitectura, SOLID, Clean Code, separación de capas, versiones justificadas y documentación viva. Primero se crea este repositorio local y luego en GitHub; después se avanza por etapas.

## Pendientes de análisis

Seleccionar y fijar versiones equivalentes de las apps Android e iOS, disponibilidad del APK y del IPA, acceso a App Automate, dispositivos, sistemas operativos y versiones Appium soportadas. Evaluar diferencias de comportamiento entre las apps antes de compartir escenarios.

Los fallos y riesgos del prototipo anterior son hipótesis o resultados de aquel entorno; se deberán trazar a una ejecución de la nueva solución antes de presentarlos como resultados propios de este repositorio.
