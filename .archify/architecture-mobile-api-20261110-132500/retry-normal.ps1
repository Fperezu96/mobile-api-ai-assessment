$ErrorActionPreference='Stop'
Set-Location 'C:\dev\mobile-api-ai-assessment'
$principal=New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$elevated=$principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
$elevated | Out-File '.archify/architecture-mobile-api-20261110-132500/retry-elevated.txt'
$cli=Join-Path $env:USERPROFILE '.codex\skills\archify\bin\archify.mjs'
node $cli finalize architecture '.archify/architecture-mobile-api-20261110-132500/candidate.json' '.archify/architecture-mobile-api-20261110-132500/arquitectura.html' --repo-root 'C:\dev\mobile-api-ai-assessment' --quality showcase --out-dir '.archify/architecture-mobile-api-20261110-132500/review-2' --json | Out-File '.archify/architecture-mobile-api-20261110-132500/retry-result.json' -Encoding utf8
$LASTEXITCODE | Out-File '.archify/architecture-mobile-api-20261110-132500/retry-exit.txt'
