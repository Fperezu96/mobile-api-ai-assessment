# Automatización móvil nativa y API

Proyecto de Felipe Pérez Upegui. La API usa Playwright Test con TypeScript; la app Android se controla con WebdriverIO, Appium y UiAutomator2. Se reutiliza Playwright Test como ejecutor y reportero de ambas suites: para móvil no se crea navegador.

## Estado verificado

- API: 8 aprobados en la última ejecución.
- Regresión móvil local: 5 aprobados, 3 fallidos, 0 omitidos. Los fallos se conservan y explican en [resultados](docs/resultados.md).
- Appium 3.9.0 e Inspector 2026.9.2 disponibles en el PC. Android 13/API 33, AVD QA_API33.
- El comando de CI se ejecutó localmente. La matriz de GitHub API 30/33 está preparada para ejecución manual, sin ejecución remota verificada.
- iOS, BrowserStack y AWS siguen pendientes; no se usó ninguna cuenta corporativa.

## Instalar y ejecutar

Node 22.18.0 y npm 10.9.3. Java, Android SDK, Emulator y Build Tools 35 son necesarios para móvil. npm ci instala las versiones fijadas de Appium y del driver; no se requiere Appium global ni instalar el driver otra vez fuera del proyecto.

    npm.cmd ci
    npm.cmd run typecheck
    npm.cmd run app:download
    npm.cmd run android:local:start
    npm.cmd run appium:doctor

El SDK de este PC está en C:\dev\.tools\android-sdk y los datos del AVD en C:\dev\.tools\android-avd. Los scripts de arranque solo ajustan variables del proceso. En otro entorno, configurar ANDROID_HOME, JAVA_HOME, ANDROID_UDID y, si aplica, ANDROID_SYSTEM_PORT y APPIUM_PORT. Android Studio puede usar esa misma ubicación de SDK.

En una terminal, dejar Appium corriendo:

    npm.cmd run appium:start

En otra terminal, ejecutar la suite o el smoke:

    npm.cmd run test:mobile
    npm.cmd run test:mobile:smoke
    npm.cmd run report:mobile

Para abrir el reporte de la regresión documentada:

    npm.cmd run report:mobile -- 2026-11-10T20-13-25-414Z

Con el emulador listo y sin otro Appium ocupando el puerto, este comando controla el servidor completo: inicia Appium, espera /status, ejecuta pruebas, conserva su salida y cierra los procesos propios:

    npm.cmd run test:mobile:ci

MOBILE_SUITE puede ser smoke o regression; por defecto es regression. La regresión conserva los fallos conocidos y termina con código 1. El smoke solo selecciona los dos datos de carrito; no declara aprobados los negativos.

API requiere BOOKER_USERNAME y BOOKER_PASSWORD en .env local, con las credenciales de práctica del servicio:

    npm.cmd run test:api
    npm.cmd run test:api:crud
    npm.cmd run report:api

## Inspector y evidencia

Inspector está instalado en C:\dev\.tools\appium-inspector-2026.9.2 y tiene acceso directo en el escritorio. Usar host 127.0.0.1, puerto 4723 y ruta /. Importar [estas capabilities](config/mobile/inspector.android-local.json). Finalizar su sesión antes de ejecutar pruebas en ese mismo dispositivo.

Cada ejecución móvil tiene un directorio propio bajo reports/mobile con HTML, JSON, JUnit, capturas, árbol UI, datos esperados, información del servidor Appium y session ID. Los logs del servidor se conservan en artifacts/android-local. Ningún instalador, secreto ni reporte generado se publica en Git.

El flujo manual de GitHub está en [.github/workflows/mobile.yml](.github/workflows/mobile.yml). No se dispara con cada push. Antes de lanzarlo, revisar los minutos disponibles de Actions; esta preparación no demuestra ejecución en dos dispositivos.

## Documentación y revisión

- [Alcance y estrategia](docs/alcance-y-estrategia.md).
- [Arquitectura y decisiones](docs/arquitectura.md).
- [Resultados, hallazgos y pendientes](docs/resultados.md).
- [Instrucciones móviles utilizadas por el agente](.agents/skills/mobile-native-tests/SKILL.md).

La skill quedó en el commit 4d786db antes del código móvil. La revisión humana, el tiempo humano acumulado y el acceso del evaluador al repositorio privado siguen pendientes. No se inventa el identificador exacto del modelo cuando la interfaz no lo informa.
