# ADR 0001 Lenguaje unificado TypeScript

Estado: aprobado por Felipe el 10 de noviembre de 2026.

## Contexto

El enunciado exige API con Playwright Test TypeScript y permite justificar otra combinación móvil frente a Appium con Serenity BDD y BrowserStack.

## Decisión

Usar TypeScript para móvil y API y mantener un único repositorio. Conservar Appium como motor móvil candidato y Playwright Test como runner obligatorio de API.

## Razones

Compartir lenguaje, convenciones y gestión de dependencias facilita mantenimiento y revisión. Felipe aprobó este enfoque considerando versiones, mantenibilidad y un entorno de desarrollo unificado.

## Costos y límites

No equivale a usar Serenity BDD Java. La documentación viva necesita una decisión explícita sobre escenarios, steps y reportes. Un monorepo no garantiza menor consumo del emulador y no obliga a compartir todas las dependencias ni los localizadores entre plataformas.

## Pendiente

Seleccionar runner móvil, capa BDD, arquitectura de acciones y versiones mediante una matriz de compatibilidad. No adoptar automáticamente las versiones del prototipo.
