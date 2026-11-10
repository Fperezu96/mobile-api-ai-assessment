# Arquitectura y decisiones vigentes

TypeScript para móvil y API está aprobado por Felipe. Compartir lenguaje y gestión de dependencias facilita mantenimiento; no garantiza menor consumo del emulador ni permite compartir todos los selectores.

## Estructura

| Ubicación | Responsabilidad |
| --- | --- |
| src/api/models | Datos tipados de reserva |
| src/api/clients | Transporte HTTP mediante un cliente inyectado |
| tests/api/fixtures | Datos únicos y preparación independiente |
| tests/api/specs | Escenarios y aserciones con steps de negocio |
| config/api | Configuración y reportes Playwright |
| src/mobile/contracts | Contratos pequeños de pantallas previstos |
| src/mobile/actions | Acciones de negocio previstas |
| src/mobile/screens/android e ios | Implementaciones específicas previstas |
| tests/mobile | Escenarios y datos móviles por implementar |
| config/mobile | Perfiles locales y nube por implementar |
| scripts/browserstack | Acceso, descarga del APK y comprobación de apertura |

La API está implementada. Los directorios móviles vacíos reservan responsabilidades, no prueban soporte Android o iOS.

## Principios aplicados y previstos

El cliente API solo transporta y los escenarios deciden expectativas. Los fixtures se encargan de datos y preparación. La inyección del contexto HTTP permite separar esas responsabilidades sin introducir capas artificiales.

Para móvil, las acciones recibirán contratos de catálogo, carrito y autenticación. Android e iOS tendrán implementaciones sustituibles con el mismo significado de datos, no una BaseScreen Android reutilizada por fuerza. Separar ciclo de sesión, configuración y evidencia evita un hook con demasiadas responsabilidades.

Son aplicaciones concretas de responsabilidad única, extensión, sustitución, interfaces pequeñas e inversión de dependencias. La I corresponde a segregación de interfaces; la inyección ayuda a D. Se toma la separación de políticas e infraestructura de Clean Architecture sin afirmar que ya exista una arquitectura completa.

## Versiones

| Componente | Versión y razón | Estado |
| --- | --- | --- |
| Node y npm del PC | 22.18.0 y 10.9.3; se preserva instalación global | Verificados |
| Playwright Test | 1.65.0 requiere Node >=20 | Instalado y ejecutado |
| TypeScript | 5.9.3 compatible con el entorno | Compilación aprobada |
| WebdriverIO cliente | 9.20.0 admite Node >=18.20.0; evita trasladar 9.33.1 incompatible con Node 22.18.0 | Instalado para comprobación de conexión |
| Appium en BrowserStack | La primera comprobación usa selección del proveedor | No hubo sesión; versión aún no comprobada ni fijada |
| Runner móvil y BDD | Evaluar Cucumber o pasos explícitos con un reporte mínimo | Pendiente |

El cliente WebdriverIO no implica tener Appium local instalado. La suite móvil requerirá decidir runner, reportes y versiones soportadas por BrowserStack. No se descargaron navegadores para API.

## Revisión de código

Se conserva del prototipo el dinero en centavos, expectativas previas e independencia. Deben resolverse sus dependencias Android, falta de perfil iOS, ausencia de pasos de negocio en reportes, mezcla de responsabilidades en hooks y pérdida de historial al reemplazar resultados.

En la API actual se revisaron tipos, inyección, datos únicos y aserciones. Se eliminó una dependencia innecesaria del fixture de datos y el negativo verifica el estado implementado, ausencia de bookingid y búsqueda vacía posterior. La limpieza autenticada verifica propiedad y ausencia posterior; quedan histórico de reportes y controles de estilo.

Los comentarios del código van en español y explican decisiones. Los nombres oficiales de APIs y librerías se conservan. La revisión del agente no sustituye la revisión humana.

## Visual Archify

[Arquitectura por etapas](../.archify/architecture-mobile-api-20261110-132500/arquitectura.html), generada con Archify 3.2 y fuentes fijadas en el commit 87b6bd113f267daf05aba7c350d56c27477d5355. Las fuentes históricas siguen accesibles en ese commit aunque los documentos actuales se consoliden.

El HTML distingue API implementada de móvil previsto. Pasaron esquema, entrega y comprobación del artefacto; browser-check falló por Chrome DevTools pipe cerrado desde ejecución elevada. Un segundo intento continuó elevado. No se desactivó el sandbox ni se modificó Archify.

Para completar esa comprobación, ejecutar el finalize desde PowerShell abierto sin administrador, usando el candidato existente, --repo-root . y un --out-dir nuevo. Los recibos conservan el detalle. La visual es consultable, pero no se afirma validación completa o revisión visual certificada.

## CRUD y autenticación

El cliente incorpora listado, filtros, PUT, PATCH y DELETE. Cada escenario usa datos UUID completos y comprueba el estado previo y posterior. Los fixtures verifican ausencia antes de crear y limpian solo registros propios. La lectura posterior comprueba consistencia observable, no durabilidad tras reinicios.

La autenticación usa credenciales locales sin adjuntar tokens. Las trazas API están desactivadas para evitar publicar cookies. El negativo de campo obligatorio lleva @characterization: comprueba el 500 implementado y la ausencia de registro; la documentación no fija ese código de rechazo. Recomendar 4xx queda como observación de diseño no bloqueante.

## Alternativas de acceso móvil evaluadas

Consulta del 10 de noviembre de 2026. Se mantiene WebdriverIO con Appium; cambiar de proveedor no requiere cambiar el lenguaje, aunque sí adaptar configuración, carga de instaladores y evidencia. No se ha contratado ni provisionado otra plataforma.

- Android local: emulador de Android Studio o dispositivo propio, sin mensualidad de nube. Requiere SDK y entorno Appium; aún no verificado.
- iOS local: la vía habitual con simulador requiere Mac y Xcode. Requiere una compilación para simulador; para dispositivos reales, una IPA y firma compatibles. El APK Android no sirve para iOS.
- AWS Device Farm: alternativa para dispositivos reales Android e iOS y Appium Node.js/WebdriverIO. Publica una promoción de prueba única de 1.000 minutos-dispositivo y después USD 0,17/minuto-dispositivo; la elegibilidad y saldo de Felipe no están comprobados. La promoción es temporal y no es una cuota mensual gratuita. Puede usarse pago por consumo sin mensualidad. Requiere integración y controles de consumo antes de ejecutar.

Fuentes: [AWS precios](https://aws.amazon.com/device-farm/pricing/), [integración Appium](https://docs.aws.amazon.com/devicefarm/latest/developerguide/test-types-appium-integrate.html), [requisitos XCUITest](https://appium.github.io/appium-xcuitest-driver/12.22/getting-started/system-requirements/) y [emulador Android](https://developer.android.com/studio/run/emulator).
