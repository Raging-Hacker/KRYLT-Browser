# Feature selection for KRYLT dev.9

Reference reviewed: https://www.opera.com/gx/features (28 October 2026).
This is an independent implementation in KRYLT's Electron architecture.

| Feature area on GX's page | KRYLT implementation |
| --- | --- |
| Integrated messengers and streaming services | Add Discord/Twitch plus requested TikTok/YouTube Studio, with dismissible floating views. |
| Tab management | Horizontal overflow, all-tab search, reopen closed tabs, normal-session restore. |
| GX Control / cleaner | Actual process CPU/memory readings, explicit or opt-in tab sleeping, cache cleanup. No simulated quotas. |
| Snapshot | Explicit PNG export of the current page. |
| Music, AI and customization | Retain YouTube Music, selectable AI websites, themes, wallpaper and sidebar controls. |

VPN service, proprietary media enhancement, account/device sync and CPU/RAM quotas
need additional infrastructure or engine support. They are not represented by
nonfunctional switches. Named workspaces and split-screen browsing remain future
work. Animations, live wallpaper and background sounds were not added because they
conflict with this update's memory/performance focus.
