# Pruebas de API y Android nativo

Evaluación técnica de Felipe Pérez Upegui. Este repositorio reúne **dos proyectos independientes**: reservas en Restful Booker y recorridos de compra en la APK My Demo App. Comparten TypeScript, ejecución y reportes; la API de reservas no es el backend de la tienda.

Playwright Test organiza ambos proyectos. Para API utiliza peticiones HTTP; para Android, WebdriverIO actúa como cliente de Appium y UiAutomator2 ejecuta las acciones nativas. WebdriverIO no es un emulador y no usamos un navegador para controlar la APK.

## Qué contiene

| Ruta | Contenido |
| --- | --- |
| tests/api y src/api | Escenarios, fixtures, modelos y cliente de reservas |
| tests/mobile y src/mobile | Escenarios, datos, contratos, acciones, pantallas y componentes Android |
| config | Configuración de proyectos, dispositivos y capabilities |
| scripts | Arranque local, ejecución y apertura de reportes |
| .agents/skills/mobile-native-tests | Skill y guía para ampliar las pruebas móviles |

Consultar [alcance y prioridades](docs/alcance-y-estrategia.md), [arquitectura y versiones](docs/arquitectura.md) y [resultados y respuestas del ejercicio](docs/resultados.md). Allí se concentran las decisiones y conclusiones.

## 1. Instalar dependencias

Los ejemplos usan PowerShell en Windows. En otras terminales usar npm en lugar de npm.cmd; los scripts del emulador son específicos de Windows.

1. Instalar Git y [Node.js 22.18.x](https://nodejs.org/dist/v22.18.0/) con npm. El proyecto admite Node 22 desde 22.18.0; verificar node --version y npm.cmd --version.
2. Clonar y entrar al repositorio:

~~~powershell
git clone --branch docs/separate-product-strategies-and-native-performance https://github.com/Fperezu96/mobile-api-ai-assessment.gi
cd mobile-api-ai-assessmen
npm.cmd ci
npm.cmd run typecheck
if (!(Test-Path .env)) { Copy-Item .env.example .env }
~~~

Si ya existe .env, conservarlo. Completar localmente BOOKER_USERNAME y BOOKER_PASSWORD con las credenciales del servicio de práctica; BOOKER_BASE_URL ya apunta a Restful Booker.

npm ci instala las versiones fijadas de Playwright Test, TypeScript, WebdriverIO, Appium y su driver UiAutomator2. No instalar versiones globales adicionales. Para estas pruebas API/nativas no hace falta descargar navegadores con playwright install.

## 2. Ejecutar primero las pruebas de API

Son las más breves y no requieren Android ni Appium. Se encuentran en [bookings.spec.ts](tests/api/specs/bookings.spec.ts).

~~~powershell
npm.cmd run test:api
npm.cmd run report:api
~~~

La ejecución genera el reporte; report:api abre el HTML local. Detener el visor con Ctrl+C antes de abrir otro reporte.

| Selección | Comando |
| --- | --- |
| Smoke | npm.cmd run test:api:smoke |
| Regresión | npm.cmd run test:api:regression |
| Negativos | npm.cmd run test:api:negative |
| Un caso concreto | npm.cmd run test:api -- --grep "API-04" |

## 3. Preparar Android y Appium

### Instalar herramientas Android

Instalar [Android Studio](https://developer.android.com/studio). En SDK Manager instalar Android SDK Platform-Tools, Emulator, Command-line Tools, Build-Tools 35.0.0 y la imagen Android 13/API 33 AOSP x86_64. Activar virtualización/aceleración compatible con el emulador.

Configurar las rutas del proceso. Cambiar estos ejemplos si el SDK o Java están en otra ubicación:

~~~powershell
$env:ANDROID_HOME="C:\dev\.tools\android-sdk"
$env:ANDROID_SDK_ROOT=$env:ANDROID_HOME
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:Path="$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"
java -version
adb devices
~~~

Las rutas predeterminadas corresponden al PC de preparación. android:local:create espera ese SDK y escribe el AVD en C:\dev\.tools\android-avd; ejecutarlo solo la primera vez y después de instalar la imagen:

~~~powershell
npm.cmd run android:local:create
npm.cmd run android:local:star
adb -s emulator-5554 wait-for-device
adb -s emulator-5554 shell getprop sys.boot_completed
~~~

Esperar que sys.boot_completed devuelva 1. Si se usa otro AVD, pasar -SdkRoot, -AvdHome y -AvdName a android:local:start y ajustar [devices.json](config/mobile/devices.json) al UDID mostrado por adb devices. Para un dispositivo físico, habilitar depuración USB, autorizar el PC y usar su UDID; no necesita crear un AVD.

### Preparar la APK y comprobar Appium

~~~powershell
npm.cmd run app:download
npm.cmd run appium:setup
npm.cmd run appium:doctor
~~~

app:download obtiene la APK definida en apps/android-manifest.json y verifica su SHA256. appium:setup lista los drivers instalados; no descarga Android. appium:doctor ejecuta el doctor del driver UiAutomator2: resolver sus requisitos obligatorios antes de continuar. No requiere instalar el antiguo paquete Appium Doctor por separado.

La sesión instala/inicia la APK mediante appium:app. No se “instalan dispositivos” dentro de WebdriverIO: el dispositivo debe estar disponible previamente. Inspector es opcional para localizar elementos; usar [capabilities locales](config/mobile/inspector.android-local.json) y cerrar su sesión antes de probar el mismo UDID.

## 4. Ejecutar las pruebas móviles

Los escenarios están en tests/mobile/specs. En una terminal, iniciar el servidor y dejarla abierta:

~~~powershell
npm.cmd run appium:star
~~~

Appium escucha en 127.0.0.1:4723. En otra terminal, desde el repositorio y con las mismas variables Android, ejecutar primero smoke:

~~~powershell
npm.cmd run test:mobile:smoke
npm.cmd run report:mobile
~~~

El [fixture nativo](tests/mobile/fixtures/native.fixture.ts) crea la sesión WebdriverIO, inyecta pantallas/acciones, recoge evidencia y cierra la sesión. El recorrido de comandos se explica en el [diagrama cliente-servidor](docs/arquitectura.md#flujo-local-de-una-prueba-nativa).

| Selección | Comando |
| --- | --- |
| Regresión | npm.cmd run test:mobile:regression |
| Negativos | npm.cmd run test:mobile:negative |
| Back y scroll | npm.cmd run test:mobile:native |
| Todos los productos del catálogo | npm.cmd run test:mobile:catalog |
| Muestra por semilla | npm.cmd run test:mobile:random |
| Descubrir sin crear sesiones | npm.cmd run test:mobile -- --list |
| Un caso concreto | npm.cmd run test:mobile -- --grep "CART-01" |

test:mobile sin filtro incluye también exploración por semilla y demostraciones adicionales; para una selección repetible usar regression. Para muestreo reproducible configurar MOBILE_DATA_SEED y MOBILE_SAMPLE_SIZE antes de ejecutar.

Como alternativa a las dos terminales, con el emulador listo y el puerto libre, test:mobile:ci gestiona Appium local y lo cierra al terminar. Aunque conserva el nombre ci, no lanza GitHub Actions ni BrowserStack.

## 5. Filtrar por tags

Los tags están en metadatos de los tests; --grep admite expresiones regulares.

| Grupo | Tags disponibles |
| --- | --- |
| Selección | @api, @mobile, @smoke, @regression, @exploratory, @random |
| API | @crud, @authorization, @isolation |
| Móvil | @cart, @quantity, @boundary, @color, @catalog, @login, @native, @back, @scroll, @navigation, @review |
| Clasificación | @negative, @characterization, @known-issue, @interview |

~~~powershell
npm.cmd run test:api -- --grep "@authorization"
npm.cmd run test:mobile -- --grep "@back|@scroll"
npm.cmd run test:mobile -- --grep "(?=.*@cart)(?=.*@quantity)"
~~~

@known-issue no omite un caso ni cambia su resultado. Consultar el descubrimiento con --list al combinar filtros.

## 6. Reportes y diagnóstico

Cada ejecución genera HTML, JSON, JUnit y execution-summary.json en reports/api/<runId>, reports/mobile/<runId> o reports/combined/<runId>. El HTML contiene pasos, esperado/obtenido y adjuntos. Las evidencias y secretos están excluidos de Git.

Abrir un intento anterior con npm.cmd run report:api -- <runId>, report:mobile o report:all. Los comandos de ejecución devuelven código distinto de cero ante fallos; los resultados conocidos están en docs/resultados.md.

## 7. Añadir un caso con el skill

En Codex, abrir el repositorio y pedir “Usa $mobile-native-tests para…” seguido del comportamiento y resultado esperado. Para preparar un prompt portable:

~~~powershell
npm.cmd run skill:prompt -- --id CART-04 --scenario "Validar 60 unidades de Backpack a USD 29,99: total USD 1799,40; comprobar cantidad e importe y después vaciar el carrito"
~~~

Copiar la salida al agente. Este comando prepara instrucciones; no genera código ni ejecuta IA por sí solo. Otro agente puede leer directamente [.agents/skills/mobile-native-tests/SKILL.md](.agents/skills/mobile-native-tests/SKILL.md). Ejemplos y criterios están en sus referencias; el MCP utilizado depende de las herramientas disponibles.

Pedir datos y expectativas concretos: “60 unidades de Backpack” es distinto de “60 productos diferentes”. Después de generar el caso, revisar typecheck, descubrimiento por ID y ejecución focalizada antes de incorporarlo a una suite. CART-03 queda como demostración seleccionable con npm.cmd run test:mobile -- --grep "@interview", fuera de smoke/regression.

## 8. Ejecutar API y móvil en una misma entrega

Con el emulador listo y Appium manual cerrado:

~~~powershell
npm.cmd run test:all:smoke
npm.cmd run report:all
~~~

Para toda la regresión usar test:all:regression o test:all; para descubrir casos usar test:all:list. test:all:catalog y test:all:random seleccionan únicamente catálogo o muestra móvil dentro del reporte conjunto. Estos comandos gestionan Appium local. El reporte conjunto mantiene cada producto separado por proyecto.\n