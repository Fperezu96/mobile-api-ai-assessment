# Mobile API AI Assessment

Repositorio de pruebas de Felipe Pérez Upegui para automatización de aplicaciones móviles nativas y API, con desarrollo asistido por IA y resultados verificables.

## Estado del proyecto

Etapa 1 completada: repositorio local creado en C:\dev\mobile-api-ai-assessment y sincronizado con su remoto privado en GitHub. La arquitectura, las versiones y la implementación se desarrollarán por etapas con revisión de decisiones. La base API ya contiene escenarios ejecutables; la capa móvil sigue en preparación.

Repositorio: https://github.com/Fperezu96/mobile-api-ai-assessment

El prototipo anterior se conserva como referencia externa y no se considera la implementación aprobada de este repositorio.

## Alcance

- App móvil instalada y escenarios de negocio de carrito, autenticación inválida y navegación.
- Android local y Android e iOS en BrowserStack App Automate.
- API independiente con Playwright Test y TypeScript contra Restful Booker.
- Skill versionada antes de su uso con un agente, revisión humana y evidencia de cambios.
- Reportes y documentación viva vinculados a escenarios, datos y ejecuciones reales.

TypeScript unificado está aprobado. El runner móvil, la capa BDD, el diseño de pasos y las versiones siguen pendientes de evaluación de compatibilidad.

## Trabajar con este repositorio

Abrir PowerShell en la carpeta del proyecto:

```powershell
Set-Location C:\dev\mobile-api-ai-assessment
git status
git log --oneline
```

Después de configurar el remoto, otro desarrollador puede obtener la base:

```powershell
git clone https://github.com/Fperezu96/mobile-api-ai-assessment.git
Set-Location mobile-api-ai-assessment
code .
```

API: npm.cmd ci, npm.cmd run typecheck, npm.cmd run test:api:smoke, npm.cmd run test:api y npm.cmd run report:api. Consultar docs/api-execution.md. BrowserStack: completar .env local y ejecutar npm.cmd run browserstack:check. La ejecución móvil aún está pendiente.

## Documentación

- [Alcance y requisitos](docs/requirements.md)
- [Etapas y criterios de salida](docs/roadmap.md)
- [Registro de decisiones técnicas](docs/decisions/README.md)
- [Decisión aprobada sobre TypeScript](docs/decisions/0001-typescript.md)
- [Entorno inicial observado](docs/environment-baseline.md)
- [Verificación del repositorio](docs/repository-setup.md)

## Reglas de trabajo

Cambios pequeños con commits descriptivos. Mantener main como base revisada y trabajar la arquitectura en una rama independiente. Conservar las decisiones y los cambios del agente para la sustentación. No declarar un caso aprobado sin ejecutarlo.

No versionar credenciales, instaladores, datos privados ni resultados generados. La documentación debe distinguir claramente lo implementado, ejecutado, bloqueado y pendiente.

## Arquitectura y revisión

- [Estado de arquitectura](docs/architecture-status.md)
- [Revisión API](docs/reviews/0002-api-review.md)
