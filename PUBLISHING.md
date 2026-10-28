# Publishing KRYLT

Publisher: Cyclonix Designs. Repository: https://github.com/Raging-Hacker/KRYLT-Browser.

## Development previews

Use a clean checkout of the commit you intend to distribute. Install Node.js 22+
and run:

```powershell
npm ci
npm run check
npm test
npm run test:integration
npm run dist:win
```

Commit and push the version and release notes first. Authenticate GitHub CLI with
`gh auth login`, then run `./Publish-KRYLT.ps1`. It reads the version from
package.json, validates the existing `dist/` installer and blockmap, creates
SHA256SUMS.txt, and publishes a prerelease targeting the current commit. Pass
`-Build` to compile before publishing or `-AssetsDirectory` to select another
output folder. It no longer expects Repository/ or ReleaseAssets/ bundle folders
and does not overwrite repository documentation or existing release assets.

This helper only accepts prerelease versions. An unsigned preview does not provide
a verified Windows publisher identity, and its stable updater remains disabled.
GitHub Actions supplies an unsigned installer artifact for review after checks.

## Signed stable releases

Follow docs/SIGNING_AND_UPDATES.md. Use the actual Cyclonix Designs certificate
Subject and thumbprint; setting product metadata alone cannot create a trusted
Windows signature. Build with `npm run release:win`, then upload the final signed
EXE, blockmap and latest.yml together to the matching stable GitHub Release.
Install the first update-enabled signed release manually. Validate a signed A-to-B
upgrade on Windows before distributing automatic updates.

## Installation data policy

Setup replaces recognized existing program files before installing the new runtime.
Automatic upgrades retain browser profiles. An explicit uninstall deletes the
app-owned profiles and updater caches, including legacy Tempest paths, across
accessible Windows profiles. Personal downloads, exported backups, cloud backups
and independently extracted portable copies are outside the installation's ownership.
