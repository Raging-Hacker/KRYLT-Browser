# Publish KRYLT on GitHub

The existing destination is https://github.com/Raging-Hacker/KRYLT-Browser. The KRYLT rebrand commit is prepared locally. A direct push was attempted but failed because this running session had no GitHub write credentials. No remote push or release publication occurred. GitHub is installed; its repository write tools were not exposed in this running session.

## 1. Update the repository files

Upload the **contents of Repository/** to the root of the repository, keeping assets/logo.png in its assets folder. Replace README.md. These public files provide the KRYLT download page and use the unchanged logo. Keep the separate application source archive private unless you choose to publish it.

In the repository's About section, set the description to:

> KRYLT browser — official downloads and updates by Cyclonix Designs.

## 2. Publish this preview

1. Open Releases > Draft a new release.
2. Create tag **v3.0.0-dev.8**, targeting main.
3. Set the title to **KRYLT 3.0.0-dev.8**.
4. Paste ReleaseNotes.md into the release description.
5. Attach all three files from **ReleaseAssets/**: the setup EXE, its blockmap and SHA256SUMS.txt.
6. Check **Set as a pre-release**, then publish.

Do not upload the EXE into the repository's Code tab. Do not publish this unsigned preview as a trusted stable auto-update. Its automatic updater is deliberately disabled. A SHA-256 checksum detects a changed download; it does not provide a Windows publisher identity.

If you use GitHub CLI, Publish-KRYLT.ps1 performs the repository-file push and prerelease creation after you authenticate with your own GitHub account. It publishes only Repository/ files and ReleaseAssets/ downloads, not the private application source. Review it before running.

From the extracted bundle in PowerShell, with Git and GitHub CLI installed:

~~~powershell
gh auth login
.\Publish-KRYLT.ps1
~~~

The script validates the supplied checksums and refuses to overwrite an existing release. Its GitHub commands follow the official CLI documentation: https://cli.github.com/manual/gh_release_create and https://cli.github.com/manual/gh_repo_clone. The script has been reviewed locally; remote publishing has not been executed here.

## 3. Repository name and upgrade compatibility

The repository's current canonical name is **Raging-Hacker/KRYLT-Browser**, confirmed through the GitHub API. The public README, publisher script and application update configuration use this address. Keep the Windows application ID/GUID unchanged to preserve the upgrade path and existing user profiles.

## 4. First trusted stable release

Follow SIGNING_AND_UPDATES.md. Obtain an approved signing identity, choose a stable version, build with npm run release:win, and publish the generated signed EXE, its matching blockmap and latest.yml together in a stable release. The preview's files cannot substitute for those signed release assets. Install the first signed, update-enabled release manually; subsequent configured releases can use the monthly updater.
