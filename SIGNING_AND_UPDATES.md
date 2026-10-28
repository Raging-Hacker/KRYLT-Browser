# KRYLT: signing and monthly updates

Prepared for Cyclonix Designs — 28 October 2026.

The updater and signing build are implemented in dev.7. The release repository is now configured as Raging-Hacker/KRYLT-Browser (https://github.com/Raging-Hacker/KRYLT-Browser). Updates are not live yet: no signing certificate or signing-service approval has been supplied. An unsigned preview deliberately has updates disabled. No private signing key or GitHub access token belongs in the shipped browser.

## Free signing options

- **Self-signed certificate:** free for testing. Windows does not trust it on other clients by default, and it does not satisfy the current public-release updater verification.
- **SignPath Foundation:** free for eligible, approved open-source projects. The full project needs an OSI-approved license and verifiable source builds; a public downloads repository alone is insufficient. The certificate publisher is SignPath Foundation; KRYLT can retain Cyclonix Designs developer branding. Its managed signing pipeline and updater publisher pin need integration after approval. No source license or publisher identity has been changed here.
- **Microsoft Store MSIX:** Microsoft signs accepted packages. This requires Store/MSIX packaging and a different update route from the current GitHub/NSIS installer.

A GitHub source-code license and a code-signing certificate serve different purposes. The current project remains UNLICENSED; opening or licensing the source requires your explicit choice.

Free-program terms: https://signpath.org/terms.html

Microsoft signing options: https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/code-signing-options

## 1. Company-certificate route, if chosen

Order an organization-validated Windows code-signing certificate under Cyclonix Designs' verified legal business name from a public certificate authority. Confirm the provider accepts your South African company and supports your preferred signing setup before buying.

Modern publicly trusted code-signing certificates generally keep the private key on a hardware token or an HSM/cloud signing service. A USB token requires the provider's driver; a cloud service requires its client/KSP and authorization. Do not assume that a new certificate can be exported as a PFX. A website SSL certificate or self-signed certificate does not establish public Windows publisher trust.

Microsoft Artifact Signing Public Trust currently lists supported organization countries that exclude South Africa. Creating an Azure resource in a supported region alone does not satisfy that identity eligibility requirement. A certificate authority's hardware/cloud option is the applicable route to investigate for this company.

The included release command supports certificates exposed through the Windows certificate store, including a hardware token or provider cloud KSP registered there. Install the provider's tools on the signing PC and confirm its certificate is visible:

~~~powershell
Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert |
  Select-Object Subject, Thumbprint, NotAfter
~~~

Copy the complete **Subject** and **Thumbprint** from the actual certificate. The certificate name can include the legal company suffix; it must match exactly. The app's marketing name remains KRYLT by Cyclonix Designs.

If your provider does not expose a Windows certificate-store key, its signing integration needs a provider-specific hook. Do not disable signature verification to work around that difference.

## 2. Choose the GitHub update repository

Use public **GitHub Releases assets**. The repository can be a dedicated public distribution repository while application source stays elsewhere. The project defaults to Raging-Hacker/KRYLT-Browser. KRYLT_UPDATE_REPOSITORY can explicitly override that feed; the configured public feed takes precedence over GITHUB_REPOSITORY so a private source repository used by CI is not accidentally shipped as the download feed.

This implementation does not distribute a private-repository access token to clients. A private source repository is fine, but use a separate public Releases repository for this feed. Draft releases and prereleases are not the stable public update channel.

## 3. Build a signed release on Windows

Use a clean checkout on the Windows signing PC. Keep the signing token attached/unlocked or authorize the cloud KSP according to its provider. Use Node.js 22 or newer.

~~~powershell
npm ci
npm test

# dev.6 has no updater; install the first signed release manually.
# Use the next appropriate stable version for the first signed release.
npm version 3.0.0 --no-git-tag-version

$env:KRYLT_UPDATE_REPOSITORY = 'Raging-Hacker/KRYLT-Browser'
$env:KRYLT_PUBLISHER_DN = 'PASTE THE COMPLETE CERTIFICATE SUBJECT'
$env:KRYLT_CERTIFICATE_SHA1 = 'PASTE THE 40-CHARACTER CERTIFICATE THUMBPRINT'

# Remove an old build so signature verification checks only this release.
if (Test-Path dist) { Remove-Item dist -Recurse -Force }
npm run release:win
~~~

These values identify the public feed and signing identity; they do not contain the private key. Keep provider passwords, PINs and cloud credentials in the provider's secure local/CI setup, not source control or chat.

The release command:

- Requires a stable X.Y.Z version, a valid repository and a certificate thumbprint.
- Enables native Windows resource editing/signing, overriding the preview build's unsigned setting.
- Requires code signing rather than silently generating an unsigned production release.
- Signs through the certificate store using SHA-256 and an RFC 3161 timestamp.
- Lets electron-builder sign the app, uninstaller and setup EXE before update metadata is finalized.
- Embeds the repository and expected publisher in the release, restoring the unconfigured source file after the build.
- Verifies the app/setup signatures, exact certificate Subject and timestamps. The builder normally removes its signed uninstaller staging file after embedding it; the script also verifies that file if retained.
- Verifies that latest.yml's installer size and SHA-512 match the final signed EXE and that its blockmap exists.

The pinned integration is electron-builder 26.0.12 plus electron-updater 6.8.11. The build uses the v26 win.signtoolOptions configuration. Do not copy v27 win.sign examples into this version without migrating and testing the toolchain.

Windows may still show SmartScreen reputation prompts for a new signed application. Signing establishes a verified publisher and integrity; it does not guarantee immediate reputation or eliminate every Windows prompt.

## 4. Publish all release assets together

Create a stable GitHub Release with the matching tag, for example v3.0.0, and attach these generated files:

| Required asset | Example |
| --- | --- |
| Signed offline NSIS installer | KRYLT-3.0.0-Setup-x64.exe |
| Matching differential-download blockmap | KRYLT-3.0.0-Setup-x64.exe.blockmap |
| Generated update manifest | latest.yml |

Make the release public/published after all three assets are attached. The included command prepares local assets; it does not publish to GitHub. Do not edit latest.yml or modify/re-sign the EXE after these metadata files have been generated. Rebuild to regenerate matching assets instead.

Uploading an EXE to an ordinary repository folder is not enough. The client reads the published Releases feed and its metadata.

For subsequent releases, increment the app version — for example 3.0.1 — then build, verify and publish the same set of assets. Keep the same publisher identity. Certificate renewal that changes the subject needs a planned transition release that trusts the intended identities before switching.

## 5. Client behavior

1. On the first launch of a configured signed release, check after a short startup delay.
2. After a successful check, schedule the next check one calendar month later. Short months clamp to their last day. The schedule is saved per Windows user.
3. If the browser was closed when due, check the next time it runs. Resume from sleep also reevaluates the due time. This does not create a Windows Task Scheduler job or run a background updater while the browser is closed.
4. Download available stable updates automatically. Reject downgrades. The updater verifies downloaded installer checksums and the expected Authenticode publisher.
5. Show **Later** / **Restart and install** after the download. Later keeps the browser running and does not silently install on ordinary exit. A known pending download is resumed/revalidated after reopening.
6. On accepted restart, verify the staged installer's publisher again and run the installer, then reopen KRYLT. Windows can request administrator approval because this app is installed for all users.
7. Failed checks/downloads retry the next day. They do not postpone a missed check for another month. Settings > Updates also provides an immediate manual check.

The new files replace the installed application. The NSIS installer's existing installation record preserves the chosen installation directory; the browser profile/vault remain in the user's app-data directory. Windows upgrade-path behavior still requires the two-version test below.

Already installed dev.6 copies cannot gain an updater remotely because dev.6 did not include one. Distribute/install the first configured signed release manually once. Later releases can then follow this update flow.

## Verification completed and remaining

Automated tests cover month boundaries/leap years, persisted schedules, manual/concurrent checks, retries, staged downloads, Later/restart behavior, rejected publisher verification, pending-download resume, required feed/publisher configuration and generated-asset tampering.

A Linux Electron fixture exercises the actual Settings > Updates UI with an injected updater: disabled preview status, check button, download progress, restart action and Later behavior. Its mock installer never changes the real app.

The supplied repository URL is configured, but real Windows Authenticode signing, live GitHub downloading, UAC approval, installation into a custom directory, profile preservation and signed version A-to-B upgrades have not been exercised. Before distributing a production update, install signed version A on a Windows test PC, publish signed version B to the test feed, use Check for updates, then verify restart, installed version, directory, shortcuts, default-browser registration and retained profile/vault.

## Primary references

- electron-builder v26 signing: https://www.electron.build/v26/docs/features/code-signing/code-signing-win/
- electron-builder v26 updates: https://www.electron.build/v26/docs/features/auto-update/
- Microsoft Artifact Signing identity eligibility: https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart
- DigiCert hardware/cloud key requirements: https://knowledge.digicert.com/alerts/code-signing-changes-in-2023
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
