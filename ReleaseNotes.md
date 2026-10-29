# KRYLT 1.0.0-alpha.1

Alpha source changes, pending Windows packaging and validation.

- Alpha semantic version and dynamic on-screen version labels.
- Pin and unpin tabs using right-click. Persist pinned HTTPS websites between launches.
- Open supported local documents, images and playable media from File > Open (Ctrl+O)
  via the toolbar shortcut and Windows file associations.
- Open media requiring external codecs using the operating system's selected player.
- Offer to save a login after a supported HTTPS password field loses focus.
  The existing vault confirms capture and encrypts credentials; private tabs are excluded.
- The current encrypted vault still requires its existing passphrase.
- Keep historical app/profile identity for data migration compatibility.

**Distribution status:** source implementation only. A signed Windows installer has
not been built. Validate Electron media codecs, default-app registration, password
prompts and pinned-tab persistence before distributing.

**Migration:** existing 3.0.0-dev.* packages have a higher version number than
1.0.0-alpha.1. This new release train requires manual installer compatibility
testing, not an automatic stable-channel downgrade.
