# KRYLT 3.0.0-dev.11

Published by Cyclonix Designs.

- Add a dedicated Movies workspace for Soap2Day with isolated storage, expanded/floating layouts, Back, Home, Reload and Guard metrics.
- Block click-triggered advertising tabs, popup floods and off-site top-level redirects in Movies.
- Hide the observed full-screen Ad Block Ghost extension advert without hiding ordinary video frames.
- Remove repeated KRYLT redirect approval dialogs. Blocked activity is counted silently.
- Keep embedded-player redirects inside their frames working.
- Suppress JavaScript dialogs, unsolicited downloads and device/notification permissions in Movies; support video fullscreen.
- Keep strict Movies protection enabled independently of ordinary Guard switches and whitelists.
- Retain dev.10 local email/password profiles, vault migration, UI fixes, adaptive performance budgets and keep/remove-data uninstall choice.

Unsigned development preview. Playback and availability depend on the external service and its players; no live video playback is guaranteed. Monthly updates remain disabled pending trusted signing.

---

# KRYLT 3.0.0-dev.9

Published by Cyclonix Designs.

- Tabs above the address bar, responsive More overflow, tab search and reopen closed tab.
- Discord, Twitch, TikTok and YouTube Studio floating tools, with recognizable service marks.
- Click the website beneath a floating app to dismiss its panel.
- Search history, delete individual visits and delete selected visits.
- Fix Settings default-browser action and password-generation form submission.
- Explicit password reveal with clearing; cancel vault restores on lock.
- Google sign-in launches an external browser on Windows even when KRYLT is default.
- Normal-session restore, opt-in inactive-tab sleeping, live performance monitor and PNG screenshots.
- Recognized-installation cleanup before setup; explicit uninstall removes app profiles/vaults/caches.
- Update the build toolchain to patched dependencies and add an audit gate.
- Repair publishing helper and add automated tests and build checks.

Unsigned development preview. Updates retain browser data; explicit uninstall
permanently removes it. Export an encrypted vault backup before uninstalling.
Trusted signing and live-service/Windows lifecycle validation remain outstanding.
