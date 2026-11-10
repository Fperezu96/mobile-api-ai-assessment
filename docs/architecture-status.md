# Arquitectura por etapas

API implementada: un desarrollador ejecuta Playwright Test mediante comandos npm. Los escenarios usan fixtures y un cliente Booking inyectado para HTTP contra Restful Booker. Reportes HTML, JSON, JUnit y trazas locales registran pasos de negocio y resultado.

Móvil previsto: WebdriverIO y Appium ejecutarán escenarios mediante acciones y contratos pequeños con Screen Objects Android e iOS. BrowserStack App Automate hospedará dispositivos Android e iOS reales, con APK e IPA separados. Android local tendrá su propio perfil. La sesión móvil aún no se ha ejecutado.

La comprobación browserstack:check requiere credenciales locales en .env y verifica App Automate sin imprimir secretos. Si faltan sale con código 2. La carga del APK y una sesión Android se ejecutarán después de comprobar acceso.

La evidencia móvil prevista incluye session ID, dispositivo, logs y capturas o video. Una conexión comprobada no equivale a una prueba funcional aprobada.
