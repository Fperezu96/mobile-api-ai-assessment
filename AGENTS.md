# Project working agreement

## Current stage

Bootstrap the local and private GitHub repository first. Do not copy the previous prototype or install frameworks before reviewing the architecture and compatibility decisions with Felipe.

## Scope

Use TypeScript for mobile and API. Include installed native apps, Android local and Android plus iOS on BrowserStack. API tests must use Playwright Test TypeScript.

## Engineering decisions

Document concrete SOLID and Clean Code applications and the appropriate separation of test intent, business actions and infrastructure. Do not claim full Clean Architecture or choose Screenplay, Cucumber or a reporting framework without explaining the tradeoff.

Version selection must account for Node on the PC, runner, Appium client and server, platform drivers, reporting integrations and BrowserStack-supported server versions.

Keep scenario and step names readable as living documentation. Keep technical selectors out of scenario intent. Preserve platform differences behind explicit implementations rather than assuming Android resource IDs work on iOS.

## Evidence

Commit the project skill before using it with an agent. Preserve invocations, diffs, actual executions, human review and known limitations. Do not fabricate Android or iOS results, weaken assertions, or hide failures.

Never commit credentials, app installers or generated reports. Avoid changes to machine-wide tools until their impact and the required project versions have been reviewed.
