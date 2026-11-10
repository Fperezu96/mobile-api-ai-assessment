# ADR 0003 Base API e inicio de estructura

Estado: implementado por solicitud de Felipe de avanzar Playwright API y estructura móvil.

Playwright Test 1.65.0 requiere Node >=20 y TypeScript 5.9.3 requiere Node >=14.17. La base API es compatible con el Node 22.18.0 observado, sin cambiar Node global. Dependencias directas exactas y resolución en package-lock.json.

Se usan steps de negocio de Playwright para documentación viva de API, fixtures con datos independientes y cliente inyectado. El cliente mantiene el transporte y las pruebas las expectativas. No se duplica una API simple en capas artificiales.

La suite no descarga navegadores ni usa BrowserStack. A02 mantiene la expectativa de rechazo 400/422 como política de calidad explícita, aunque el contrato solo indica campo obligatorio y no fija error. Se documenta el residuo de reservas sintéticas; no se publican credenciales de limpieza.

WebdriverIO/Appium se incorporarán tras validar versiones y conexión con la nube. La estructura móvil distingue contratos, acciones y pantallas por plataforma; los directorios vacíos no prueban que existan implementaciones.
