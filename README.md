# KRYLT 3.0.0-dev.12

Fix blank pages caused by cancelling ordinary cross-origin sign-in and application redirects. Normal server redirects (including 302/303 chains), delayed JavaScript routing and frame-driven application navigation can complete. Known advertising destinations remain filtered; Movies retains its stricter popup and navigation containment.

Main-document network or renderer failures now show a page with Try again, Back, Home and Protection settings. Retrying uses the intended web address. Failed subresources and cancelled/superseded navigations do not replace a working page. A new tab displays its destination hostname while waiting for the site title.

Previous profile, vault, bookmark, installer and Movies changes are retained. This unsigned preview does not enable automatic updates. Testing uses controlled login-style fixtures; no live Salesforce account or organization data is accessed.

---

# KRYLT 3.0.0-dev.11

Movies opens the requested Soap2Day website in a dedicated, expandable workspace with separate site storage, Back, Home, Reload, and live Guard counters. Use the Movies shortcut in the sidebar. Restoring the floating layout enables the existing resize handles.

A targeted cosmetic rule hides the observed Ad Block Ghost extension advert and its full-screen click overlay.

Movies blocks all new windows/tabs, off-site top-level navigation, JavaScript dialogs and downloads. Protection stays on even if ordinary Guard settings are disabled or the source is whitelisted. Embedded cross-origin players and their own frame redirects can still load. Notification/device permission requests are denied; video fullscreen is permitted. The service remains a third-party website; availability and playback depend on it and its embedded players.

Ordinary browsing now silently blocks website-created tabs/windows by default, including those triggered during a real click. Cross-site automatic redirects and frame takeovers are counted without interrupting modal dialogs. Trusted sites can be added to Guard's whitelist for ordinary popup-dependent workflows. Normal clicked links remain usable.

This update retains all dev.10 profile/vault, UI, performance, location and uninstall changes. It remains an unsigned preview; automatic updates stay disabled until trusted signing is configured.

---

# KRYLT 3.0.0-dev.10

This update fixes the title-bar drag region, responsive bookmark overflow, multi-provider AI icon and camera screenshot button. Floating panels resize from their left edge or bottom-left corner. KRYLT Guard has persistent counters, a site whitelist and stricter popup/cross-site redirect handling.

New profiles use an email and password. Existing vaults require the previous vault password once to migrate saved logins. Optional Google profiles use verified Google sign-in and the device's secure encryption; a registered Desktop OAuth client is still required. Exported/Google backups use a separate backup password so they remain portable.

Performance offers maximum live tabs, keep-awake tabs, adaptive RAM/CPU budgets and CPU/GPU rendering selection (restart required). Budgets can be exceeded by the active/protected tabs and browser overhead. A GPU percentage hard cap is not supported by Electron and is explicitly unavailable. Approximate search location is opt-in, uses the public IP through ipapi.co, and is not hardware GPS; clear it in Privacy settings.

Uninstall now asks whether to keep or remove all KRYLT browser data. Keeping data is the default, including silent uninstalls. Explicit automation may use /REMOVEUSERDATA to remove app-specific data. Upgrades retain profiles. Export an encrypted password backup before removing data.

This preview is unsigned. Monthly updates remain disabled until a trusted signing identity is configured. The validation history below describes earlier builds and does not prove live Google sign-in, GPU driver behaviour or the new Windows lifecycle checks.

---

# KRYLT 3.0.0-dev.9


## New in dev.9

Published by **Cyclonix Designs**. This update fixes the Settings default-browser
button and password-form utility buttons, adds individual/selected history deletion
and search, and moves tabs above the address bar. Overflow tabs appear in a native
**More** menu; **Ctrl+Shift+A** searches every open tab. Site tabs and bookmarks use
page favicons or recognizable bundled service marks instead of letter avatars.

The sidebar adds Discord, Twitch, TikTok and YouTube Studio alongside WhatsApp,
YouTube Music and AI services. Clicking the underlying website dismisses the
floating panel without changing the page's URL or size. Escape and the close button
also dismiss it; the service remains loaded until unloaded through Settings.

Normal tabs restore on startup (disable in Performance settings). Background
restored pages remain asleep until selected. Private tabs are never saved or added
to the reopen-closed list. Ctrl+Shift+T reopens a recently closed normal tab.
Performance shows live CPU and memory usage, offers manual tab sleeping and cache
cleanup, and supports optional sleeping after 5/15/30 inactive minutes. Sleeping
reloads the page and may lose unsaved input. Audible/captured pages, the active tab
and tabs during active downloads remain running. These are memory-saving controls,
not hard CPU/RAM quotas. Ctrl+Shift+S saves a PNG of the current page.

Password generation no longer submits the login form. Reveal displays the password
after native confirmation, then clears it after 15 seconds, lock or panel departure.
Vault restore is canceled if the vault locks while decryption/confirmation is in
progress. Google authentication selects an installed external browser on Windows,
including when KRYLT is the system default; live OAuth still needs your registered
Desktop client and validation with real accounts.

Setup checks the selected folder before extraction. It removes stale contents only
from a recognized KRYLT/legacy installation, keeps the old uninstaller available
for the builder's upgrade step, and refuses unrelated nonempty folders. Updates
retain browser profiles. **Explicit uninstall permanently deletes KRYLT and legacy
app profiles, vaults, cookies, history, settings and updater caches from accessible
Windows profiles**, plus app registrations and shortcuts. Export an encrypted vault
backup first if needed. Uninstall does not search for or delete personal downloads,
exported backups, separately extracted portable copies, or cloud Drive backups.
Locked/inaccessible/redirected profile folders are reported if cleanup is incomplete.
The custom cleaner handles all known app profile paths; the builder's separate
single-user data cleaner is disabled to avoid duplicate traversal of redirected paths.

Run `npm run check`, `npm test` and `npm run test:integration`. The committed Electron
fixture covers real shell/HTTPS credential flows with test dialogs and a test-only
container sandbox substitution. GitHub Actions checks Linux UI flows and Windows
cleanup/builds. See `docs/GX_FEATURE_REVIEW.md` for the selected GX-inspired features.

Windows x64 desktop browser development build with dedicated KRYLT branding, transparent eagle logo, KRYLT landing artwork, collapsible sidebar, Google search and direct Canva access.

## New in dev.8: KRYLT

The application, Windows EXE, setup wizard, shortcuts, default-browser display name, About/settings copy, bookmark exports, theme pack and wallpaper now use **KRYLT**. Cyclonix Designs remains the developer. The new wallpaper was edited from the supplied eagle/mountain scene; the original transparent eagle icon is retained.

The package name is now krylt. Compatibility is preserved through the existing Windows application ID/GUID, normal/private session partition names, user profile/cache directory, metadata file, encrypted-vault format and cloud backup tag. These hidden compatibility identifiers deliberately retain legacy spelling so existing data and HTTP/HTTPS default associations can continue across the rename. New bookmark JSON exports use krylt-bookmarks; old tempest-bookmarks files remain importable. Vault restore accepts both krylt-vault and tempest-vault filename extensions.

Close the earlier browser before running the new installer. The NSIS installation record retains an existing custom installation path; a fresh install defaults to Program Files/KRYLT. Actual Windows upgrade/custom-path/default-association behavior still needs a Windows smoke test. Keep an encrypted backup of your vault when moving profiles or PCs.

KRYLT is the selected product name. Trademark clearance has not been established, and no trademark registration or open-source licence change is implied.

## Signing and monthly updates

Monthly update checks, automatic downloads and an explicit restart/install prompt are implemented for configured signed Windows releases. The per-user schedule persists across app restarts, network errors retry the following day, pending downloads resume after reopening, and Settings > Updates offers a manual check and download progress. Stable releases only; downgrades are disabled. Later keeps the current browser running.

The public update repository is configured as Raging-Hacker/KRYLT-Browser. The preview waits for a verified signing identity; the company-certificate release command requires the real certificate Subject/thumbprint. Missing/mismatched feed or publisher configuration disables automatic updates. Signing credentials and private repository tokens are not bundled.

Read **docs/SIGNING_AND_UPDATES.md** for certificate setup, Windows signing commands, publishing the EXE + blockmap + latest.yml, bootstrap installation and the Windows A-to-B upgrade test. The current source includes npm run release:win with required signing and post-build signature/timestamp/checksum checks. No real signing identity or live update release has been configured yet. The guide includes free signing routes and their eligibility/trust limits.

The dev.9 preview includes the updater but keeps it disabled until a verified signing identity is configured. The public release repository is Raging-Hacker/KRYLT-Browser, matching its current canonical GitHub name.

## Install on Windows

Run `KRYLT-3.0.0-dev.9-Setup-x64.exe`. This is a full offline Windows x64 installer, not the portable app launcher. It requests administrator access, defaults to Program Files on your Windows drive, and lets you choose another destination. Setup adds Start menu/desktop shortcuts and an entry in Windows Installed apps, including an uninstaller.

The wizard introduces KRYLT's existing features and identifies **Cyclonix Designs** as the developer. On the final page, the optional **Choose KRYLT as my default browser** checkbox opens Windows Settings. Choose KRYLT and confirm **Set default**. This choice starts unchecked. Setup registers HTTP and HTTPS support without replacing your current default. You can open the same Settings page later from KRYLT Settings > About & reset.

On Windows 10 or older Windows 11 releases, the Settings link may open the general Default apps page; select KRYLT there. This build registers web links only; local HTML file opening is not implemented.

The installer and app are **unsigned**. Cyclonix Designs appears in the wizard and file metadata, but Windows can show **Unknown publisher** until a code-signing certificate is provisioned. Windows 10/11 x64 installation and runtime need a real Windows smoke test. The monthly updater is included and waits for verified signing configuration. Explicit uninstall removes app profiles and vaults. Store a separate encrypted vault backup before uninstalling or migrating PCs.

Existing normal-profile data is kept in the same userData location; installation does not import another Windows account's data. Close the portable app before installing, then use the installed shortcut. The old portable folder is not removed automatically.

From source, install Node.js 22.12 or newer, run `npm ci`, then `npm start`. If installation scripts are disabled, run `node node_modules/electron/install.js` first. Run as a normal user; keep the sandbox enabled.

## Installer features retained

- Full branded installation wizard with a selectable destination, benefits page, shortcuts and uninstall support.
- Cyclonix Designs developer name in setup, About, and Windows file resources.
- Windows HTTP/HTTPS browser registration and an optional default-browser Settings link.
- Initial and subsequent external HTTP/HTTPS links open inside KRYLT; subsequent launches reuse its window. Native schemes, credential-bearing URLs and oversized arguments are rejected.
- Websites receive the actual bundled Chromium user-agent version without Electron/application tokens. This addresses browser-detection incompatibilities such as WhatsApp's Chrome update message without pretending to have a newer engine. The same identity is used by sidebar apps, normal tabs and private tabs. Site cookies and login databases are retained.
- WhatsApp's panel reload bypasses the HTTP cache to refresh an old unsupported-browser response.

## This update

- Collapsible navigation sidebar with persisted expanded/collapsed state.
- Click-to-toggle floating WhatsApp Web, YouTube Music and AI panels (ChatGPT, Gemini, Claude). Panels overlay the existing page without changing its URL or size. Header controls reload, close and open the app in a full tab; Escape closes it.
- Sidebar app sessions share the normal browsing profile. They are unavailable in private tabs. Closing hides and retains an app; Unload sidebar apps releases its views. Hidden apps are muted by default. Nine app views maximum are created, on demand.
- A bookmark bar below the address bar; right-click for Open, Rename and Delete. The bookmark manager supports inline rename and delete. Titles are limited to 120 characters. No modal prompt implementation is required.
- Categorized, searchable settings: appearance, sidebar apps, privacy/permissions, downloads, extensions and About/reset.
- Functional controls for wallpaper, bookmark bar, sidebar collapse, page zoom, panel width, default AI service, hidden app audio, sidebar shortcut visibility, notification/media prompts, download folder/save prompts, separate browsing-data clearing, theme/extension management, and reset.
- Validated settings, bounded input, corrupt-setting normalization, atomic local persistence with a visible save-error message, and reset without deleting bookmarks.

Services may reject embedded-browser sign-in, require an account or subscription, enforce DRM, or have layouts unsuitable for narrow panels. The app integrates their websites; it does not supply an AI model, paid subscription or service API. No page content is automatically sent to an AI service. Live account/sign-in workflows have not been tested. Use the full-tab button if needed.

## Browser features

Real remote pages use WebContentsView rather than iframes. Includes horizontal tabs with overflow, private tabs, back/forward/reload, bookmarks, history, downloads, domain request filtering, and dark/light appearance. Ctrl+L, Ctrl+T and Ctrl+W are supported. Website permissions are denied by default. Optional native prompts can allow notifications or camera/microphone for the current document; other device access remains denied. Private tabs have separate memory-only sessions and do not share accounts with normal tabs or other private tabs. Downloads remain on disk. Maximum 40 open tabs.

## Engine: precise compatibility statement

Pinned to Electron 45.1.0, the latest stable Electron release checked on 28 October 2026. Its bundled Chromium is 156.0.8078.49. This is the current Chromium major, NOT the newest Chromium patch: the desktop Chrome release was 156.0.8078.73/.74 when checked. The engine cannot be replaced with an arbitrary Chromium binary. Exact latest-patch parity requires an upstream runtime update or a separate maintained Chromium fork.

This remains an Electron/Chromium application, not the full Chromium fork from the production plan. The settings page reports the actual runtime version. No claim of completed production-browser security is made.

## Google services and extensions

Google links open the real websites in KRYLT's normal browsing session. Google decides whether a particular sign-in flow accepts embedded browser engines; acceptance has not been verified. Web compatibility uses the bundled Chromium identity with Electron/application tokens removed. It does not alter the engine version, implement proprietary Google Chrome APIs, or bypass Google sign-in restrictions. Browser-level Google account sync, Google password sync and proprietary Google browser APIs are not implemented.

Extensions: load a trusted unpacked folder containing `manifest.json` in Settings. Electron supports only a subset of extension APIs. Automatic Chrome Web Store installation, packed CRX installation, full toolbar popup support and universal extension compatibility are not supplied. Extensions are powerful code; the native dialog lists requested permissions before installation. Private sessions do not load extensions.

Theme packs: import a KRYLT JSON color pack in Settings. All seven colors must be six-digit hexadecimal strings (`bg`, `surface`, `raised`, `text`, `muted`, `line`, `blue`). Arbitrary CSS, scripts, and remote image URLs are rejected. These are KRYLT packs, not Chrome Web Store themes. Imported colors override light/dark defaults until reset. Wallpaper uses the renamed eagle scene.

## Branding and legal notices

Application-owned UI, search routing and Windows resources use KRYLT branding. Engine identifiers required for compatibility, extension API namespaces and third-party license notices remain intact. Third-party websites show their own branding. No affiliation with Google, Canva, or other services is implied.

The source logo had an opaque checkerboard; an image-editing pass removed that background to genuine PNG alpha. App icons are derived from that PNG. The landing artwork is edited to use KRYLT; see docs/ASSET_NOTES.md for the prompt and asset path.

## Security and known omissions

Remote pages have no Node integration or preload bridge. Sandbox, context isolation, web security and site-per-process are enabled. The browser UI has a restrictive CSP. Privileged commands validate the sender and main frame. Main-frame navigation is restricted to HTTP(S); native scheme navigation and shell execution are not exposed. Filtering uses a small domain list, not a full production blocking engine.

Not implemented: full Chromium fork, latest-patch parity, production security audit, malicious-URL reputation provider, custom fingerprint randomization, signed installer, signed automatic updates, full extension ecosystem, production-audited password manager, profile UI, named workspaces, named tab groups, sync, native AI inference, wallet, rewards, VPN, conferencing. Do not treat this as an audited production browser.

Settings/bookmarks/history are stored in the app's userData directory. Metadata is not separately encrypted. No KRYLT analytics backend is configured. Websites and Google receive normal requests. Existing v1 Studio project data may remain in the previous metadata file, but there is no editor or project API in this version.

## Build

```
npm ci
npm test
npm run dist:win
```

On Linux, `npm run dist:win:linux` cross-builds the unsigned installer with the pinned builder's official uninstaller reader, without Wine or dependency edits. Optional `KRYLT_ELECTRON_DIST` may point to a folder containing the matching Electron Windows ZIP. Review this integration before upgrading electron-builder.

The default Windows build is the assisted NSIS installer. Optional portable ZIP: `npx electron-builder --win zip --x64`. A cross-platform afterPack hook applies the KRYLT icon and executable metadata without Wine. Signing requires a separately provisioned identity. Keep Electron maintained before further distribution.

## References

- https://releases.electronjs.org/release/v45.1.0
- https://chromereleases.googleblog.com/2026/10/stable-channel-update-for-desktop_0562499947.html
- https://www.electronjs.org/docs/latest/api/extensions

Third-party dependencies retain their licenses; bundled legal notices must not be removed.

## Settings behavior

Settings change the running application and are saved locally. Zoom applies to current and future ordinary tabs. Panel width is clamped to the available window width. Bookmarks-bar visibility adjusts native page geometry. Search filters setting categories and their keywords. Reset restores defaults and theme while retaining bookmarks/history/site data.

Download destination is selected through an OS folder dialog. When save prompts are disabled, filenames are sanitized and collisions receive numeric suffixes. When prompts are enabled, the chosen folder is the dialog default. Private downloads are still persistent files.

Permission grants are in memory, scoped to a web contents and origin, and cleared on top-level navigation and tab closure. Resetting grants affects future checks; stop active media streams or reload the page to end already-running capture. An allowance can cover both microphone and camera under the engine's media permission. No claim of comprehensive enterprise permission management is made.

Floating panels are independent sandboxed web views, not injected scripts or iframes. The local panel toolbar has a restricted IPC command allowlist; remote app views have neither Node.js nor a preload bridge. Sidebar apps share normal-profile extensions and website cookies. Opening a popup from a sidebar app creates a normal tab; some authentication flows may not work through this simplified popup handling.

## Bookmark import and export

Open Bookmarks in the sidebar, then use:

- **Import bookmarks…**: choose an HTML/HTM bookmark export from another browser or a KRYLT JSON backup.
- **Export HTML…**: save a standard Netscape-format bookmark file suitable for importing into major browsers.
- **Export backup…**: save a versioned KRYLT JSON file.

Import merges into the existing collection. Existing bookmark names are retained when normalized URLs match. Unsupported schemes (including javascript:, file: and data:), credential-bearing addresses and malformed entries are skipped. Titles are capped at 120 characters; supported links are HTTP/HTTPS. Folder contents are flattened, since this version has no folder UI. Files must be UTF-8 and at most 5 MiB. The collection limit is 500 bookmarks. The summary reports imported, duplicate, invalid and over-limit entries. Source files and existing bookmarks are never deleted by import. Canceled dialogs make no changes. Export includes bookmarks only, not history, cookies or credentials.

## Password vault (development implementation)

Open **Passwords** in the sidebar. Create a separate vault passphrase of at least 12 characters, then add logins manually or use the key button next to the address bar to save/update a login from the active HTTPS page. Saving and filling are explicit user actions; this version does not monitor submissions or silently autofill.

- AES-256-GCM authenticated encryption; a fresh 96-bit nonce per write.
- scrypt key derivation with a random 128-bit salt, N=131072, r=8, p=1; fixed parameters prevent hostile backup KDF settings.
- Encrypted vault stored separately from browser metadata in `password-vault.json`; usernames, origins and passwords are inside the ciphertext.
- Lock after 5 minutes without vault operations, on minimize, screen lock, suspend and exit. JavaScript cannot guarantee complete removal of all strings from process memory; this is best-effort key-buffer clearing, not protection against a compromised OS/process.
- No plaintext password export or clipboard copy. Encrypted local backup export/restore is provided.
- Up to 1,000 entries and a 5 MiB encrypted vault limit. Existing origin+username pairs update in place.
- Fill only on the exact saved HTTPS origin, in the active normal tab's main frame, after native confirmation. One visible current-password field and a same-origin form action are required. Cross-origin iframes, multi-step login flows, signup/new-password forms, HTTP pages and private tabs are not supported.
- Reveal asks for native confirmation; the revealed field is cleared after 15 seconds. Locking removes the vault interface and metadata from view.
- Remote pages receive no preload or Node access. The broker injects a narrow, origin-checked isolated-world script only after an explicit save/fill command.

Google backup code is implemented but **not live-configured**. Import a registered Desktop OAuth client JSON under Passwords to enable the external-browser sign-in flow. Tokens remain in memory. Backups are manual encrypted Drive app-data snapshots, not Google Password Manager/Chrome Sync integration. See `docs/GOOGLE_BACKUP_SETUP.md`. Live Google sign-in and Drive transfers remain unverified.

No passphrase reset or recovery bypass is available. Keep the passphrase and an encrypted backup safe. This development implementation has not received independent security review and should not yet hold important real-world credentials.

