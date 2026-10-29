# KRYLT dev.10 validation — 29 October 2026

- 56 automated tests pass, including local email/password profiles, legacy vault migration, wrong-password rejection, Google account/device-encryption boundaries, portable backup restore preserving the profile password, Guard whitelist boundaries/counters, search region handling and resource-setting bounds.
- Linux Electron integration passes for the new profile UI and existing vault capture/fill, tabs, icons, Guard whitelist and native floating-panel resizing. Only test fixtures substitute dialogs, the single-instance lock, sandbox and a pinned localhost certificate.
- Windows CI passes fresh installation, in-place replacement retaining the vault, silent keep-data uninstall, reinstall and explicit /REMOVEUSERDATA removal of profile/cache plus browser registration cleanup. Interactive Yes/No prompts and real user UAC presentation still need a client smoke test.
- Resource limits are adaptive tab/RAM/CPU budgets, not hard OS quotas. Protected/active/media tabs can exceed budgets. GPU percentage caps are unavailable. CPU/GPU rendering changes require restart.
- Network location is opt-in and approximate (country/city from public IP), not hardware GPS. Lookup/parsing and regional query changes are covered by fixtures; live website location providers and real Google OAuth accounts are not exercised.
- Publisher Google OAuth configuration is required to enable Google sign-in. Clients can create local profiles without it. No credentials, signing certificate or live Google client have been fabricated.
- This remains an unsigned preview with automatic updates disabled pending trusted signing configuration.

Earlier validation follows.

# KRYLT dev.9 validation

28 October 2026

- Build dependencies upgraded to electron-builder 26.18.0 after checking published security advisories (npm audit reports zero vulnerabilities); runtime updater remains 6.8.11 with builder-util-runtime 9.7.0.
- 49 Node tests pass, including history visit deletion, private-session exclusion,
  responsive overflow selection, safe favicon transport, external Windows auth
  routing, vault restore cancellation and malformed Unicode OAuth state handling.
- Electron 45.1.0 integration checks pass for horizontal tabs/More selection, tab
  search, new service logos, real native outside-click dismissal with unchanged
  page bounds, individual history deletion, password generation without submit,
  manual save and real isolated-world HTTPS capture/fill, reveal/lock clearing,
  process metrics, PNG export, and session persistence across window closure.
- Runtime fixtures use a temporary profile, a pinned local test certificate,
  substituted native dialogs, a substituted single-instance lock and a root-only
  sandbox override. None of these substitutions enters the production package.
- Unsigned Windows x64 NSIS installer cross-compiles with the pinned builder.
  Setup and uninstaller embed the new cleanup scripts. Windows cleanup regression
  tests are committed for CI, including unrelated-folder rejection, stale-file
  removal, directory-junction boundaries and legacy vault-profile removal.
- Production source keeps sandbox/context isolation and remote Node/preload
  restrictions. Private tabs do not enter saved sessions or closed-tab history.
- Real Windows install/upgrade/uninstall, UAC/default-association behaviour and
  live service/OAuth accounts still require Windows testing. No certificate was
  supplied; this preview remains unsigned and stable auto-updates remain disabled.

Historical validation records below describe earlier builds.

# KRYLT dev.8 validation

28 October 2026

- Rebrand uses the krylt package name while preserving the existing Windows application ID/GUID, profile and cache directory, session partitions, vault format, cloud backup lookup tag and legacy browser ProgID. Public app/installer names and display copy use KRYLT.
- Regression tests cover reading legacy metadata and unlocking the existing encrypted vault through the renamed identity, old bookmark JSON imports, new branded exports, compatible old/new build environment variables and current Chromium-compatible user-agent stripping.
- The original transparent emblem remains; built-in ImageGen edits the supplied wallpaper text to KRYLT. The old Tempest wallpaper is excluded from the application package. The installer sidebar is regenerated with the KRYLT label.
- Trademark availability remains unverified; the rename records the user's selected name. No registration, licensing change or signing-service approval is claimed.
- 36 automated tests pass. A Linux Electron fixture confirms KRYLT title/wordmark/bridge and About/default-browser copy, original logo and renamed wallpaper loading, retained profile/cache paths and bookmarks, and unlocking the pre-existing encrypted vault through renderer IPC. The fixture substitutes only container sandbox/single-instance restrictions; delivered code retains production settings.
- Windows x64 assisted NSIS installer compiles. App/setup PE resources show KRYLT and Cyclonix Designs; no old-branded or temporary filename appears in the setup payload. Extracted KRYLT.exe, app.asar and theme bytes exactly match the packaged directory. Original logo.png and icon.ico bytes match the supplied application. Old wallpaper is absent from app.asar.
- App/setup are unsigned. Actual Windows install/upgrade, custom-path retention, shortcut/registry changes, default-browser selection, live WhatsApp and signed auto-update installation still require a Windows smoke test.

Earlier validation follows for unchanged features.

# Earlier browser build dev.7 validation

28 October 2026

- 33 automated tests pass, including 12 tests for scheduling, update control, feed/signing configuration, default public-repository precedence over a private CI source repository, and release-asset verification.
- Update-controller tests cover monthly UTC calendar boundaries (including leap years), persisted schedules, due-at-next-launch behavior, manual/concurrent checks, next-day failure retries, pending-download resume, automatic staging and explicit restart approval. The updater rejects prereleases/downgrades and does not auto-install on an ordinary quit.
- Feed configuration tests reject missing/wrong publisher identity, changed repositories, private/token-based feeds, and disabled signature verification. The release configuration forces Windows signing/resource editing and omits build-only secrets from shipped policy. Generated-asset verification detects installer modification and missing blockmaps.
- Linux Electron fixture UI checks pass for disabled preview status, Check for updates, progress/disabled duplicate-check button, downloaded/restart state, Later keeping the browser open, and publisher verification before the mock installer callback. QA runs in a separate profile with container-only sandbox/single-instance substitutions. Delivered source keeps production sandbox and OS lock behavior.
- The supplied public repository Raging-Hacker/KRYLT-Browser is configured. No real certificate, signing-service approval, update release or token was supplied. Authenticode signing, live feed downloads, real Windows upgrade/UAC/custom-path preservation and two-version signed installation remain unverified. Preview auto-update is disabled; production release script requires a configured certificate and feed.
- Unsigned Windows directory packaging succeeds. The resulting app.asar is checked against final update code and policy, and includes electron-updater 6.8.11 and js-yaml. Production signing/publishing configuration passes the pinned builder schema.
- Existing dev.6 installer and WhatsApp compatibility behavior remain unchanged by these source additions.

Earlier validation follows for unchanged features.

# Earlier browser build dev.6 validation

28 October 2026

- Base: user's re-uploaded dev.5 Windows ZIP. Its SHA-256 matches the recovered dev.5 release. App source/assets in app.asar match the recovered source before the intended changes.
- 21 automated tests pass, including new tests for actual-version Chromium identity and safe/bounded external HTTP/HTTPS launch arguments. Existing bookmark, policy, settings, credential-page, encrypted vault and mocked Google backup tests remain passing.
- Electron 45.1.0 Linux runtime fixture checks pass for request/DOM user-agent agreement, WhatsApp panel identity, configured sandbox/context isolation/Node/preload boundaries, cache-bypassing reload, opening the panel in a full tab, memory-only private sessions, rejection of sidebar tools in private tabs, and an external-link second-instance event opening in the existing window.
- Runtime QA runs a temporary copy with sandbox disabled because of container limitations. The Linux single-instance OS lock is substituted in the QA copy because local UNIX sockets are unavailable. Delivered source retains app.enableSandbox(), all remote-view security settings and the real single-instance lock. The second-instance handler itself is exercised; the Windows lock is not.
- Live WhatsApp was attempted directly and through the environment's proxy. Direct connection returned ERR_EMPTY_RESPONSE; the proxy path returned ERR_CERT_AUTHORITY_INVALID. No certificate checks were bypassed. Live QR pairing/account access remain unverified; the browser-identification fix is covered by local request/DOM checks.
- Windows x64 assisted NSIS installer and uninstaller compile successfully using the pinned electron-builder 26.0.12 templates. On this Linux host, the builder's official UninstallerReader extracts the unsigned uninstaller without executing Windows code. No dependency source is modified.
- Setup uses Program Files on the Windows drive by default, with destination selection enabled. Cyclonix Designs branding, a feature introduction page, desktop/Start menu shortcuts, Windows Installed apps/uninstall support, and optional unchecked default-browser Settings choice are included.
- Installer registration covers HTTP/HTTPS capabilities with quoted executable/URL arguments and a command-line switch terminator. No UserChoice keys are written. Uninstall removes the application's registration and retains profile data unless the builder's explicit delete-app-data switch is supplied.
- Compiled setup payload is extracted and checked against the packaged app. The packaged main/UI/browser integration source is byte-checked against the delivered source; app metadata, Windows resource branding, integrity resource and uninstaller are inspected.
- Windows installation, UAC/SmartScreen presentation, actual registry writes/cleanup, Settings confirmation, actual OS external-link dispatch, shortcut launches, upgrade behavior and live WhatsApp pairing require a real Windows smoke test. Linux fixture checks do not establish those behaviors on Windows.
- Installer and app are unsigned; no signing identity or automatic updater is configured. Existing security/DRM/extension/service limitations remain.

The earlier dev.5 validation record follows for unchanged features.

# Earlier browser build dev.5 validation

28 October 2026

- Seven policy/settings regression tests pass: URL restrictions and Google normalization, filtering hostname boundaries, theme validation, invalid setting rejection, corrupt-setting normalization, and bounded bookmark renaming.
- Syntax checks pass for main.js, ui.js, tool.js and settings.js.
- Electron UI checks run on Linux in a temporary QA copy with a test-only sandbox override required by the root container. Delivered source keeps app.enableSandbox(). Windows sandbox/runtime behavior is unverified.
- Local HTTP fixtures stand in for remote sidebar services. Live WhatsApp pairing, AI sign-in, YouTube Music playback and DRM have not been validated.
- Bookmark save → bar display → inline rename → bar update → delete passed.
- Floating app retains underlying page ID, URL, visibility and native bounds. Remote tool view has Node disabled and no preload.
- Tool switching, width setting, collapsed-sidebar geometry, settings search, bookmark-bar geometry, page zoom and invalid-setting rejection passed.
- Home returns same tab; app unload releases all tool views; private tabs reject normal-profile tools.
- Settings persist to local JSON; no UI exceptions in the tested flows.
- Native composite overlay and settings screenshots are used for internal visual QA only.
- Existing production limitations remain: unsigned Windows distribution, no automatic updater, no independent security audit, no newest-Chromium-patch parity, no browser-level Google sync or full extension-store support.
- Forced tool-renderer crash followed by reload recovered the fixture while the browser stayed running.

## Bookmark transfer validation

- Four additional tests cover browser HTML parsing, nested-folder flattening, entities, unsafe URLs, duplicate normalization, HTML/JSON Unicode round trips, escaped output, preservation of existing names, capacity limits, malformed JSON, oversized files and no input mutation on failure.
- File-dialog workflow tested using a temporary Linux QA copy and native-dialog test substitutions: HTML import, summary counts, bookmark bar refresh, HTML export, JSON backup export and canceled import.
- Windows runtime remains unverified. Live imports into third-party browsers have not been exercised here; HTML format is the standard Netscape bookmark representation.

## Password vault validation

- Tests cover encryption at rest, metadata-only listing, wrong passphrase, lock/unlock, same-origin update, delete, tampered backup rejection, hostile KDF parameter rejection, restore cancellation, encrypted restore, random nonces, password generation and lock-during-unlock cancellation.
- Isolated-world script fixtures cover visible same-origin HTTPS capture/fill, wrong origins, cross-origin form actions, hidden fields and new-password fields.
- Google configuration tests reject wrong client types/invalid IDs and ignore injected endpoints. A mocked Drive test checks encrypted-only upload, normal authorization headers, scoped backup selection and encrypted restore bytes.
- Linux UI tests exercise vault creation, manual save, encrypted file inspection, backup export, lock, incorrect passphrase, unlock, metadata listing, denied fill without a matching page, local restore and disabled unconfigured Google sign-in. Test-only native dialogs and sandbox override are confined to a temporary QA copy.
- No live Google OAuth/Drive integration or independent security audit has been completed. No production credential-safety claim is made.

- HTTPS fixture runtime checks passed for explicit password fill and capture through the actual isolated-world API; a different HTTPS origin was rejected. No real user credentials were used.

