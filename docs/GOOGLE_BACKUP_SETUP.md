# Google-connected encrypted vault backup

## Status

The app includes the desktop OAuth/Drive integration, but no developer-owned Google client credentials or verified consent screen are supplied. Google backup is disabled until a valid configuration is imported. Live Google authorization/upload/restore have not been tested in this environment.

This is KRYLT's encrypted backup feature. It does not connect to Chrome Sync or Google Password Manager and does not write passwords into Gmail.

## Developer setup

1. Create/select your Google Cloud project and enable the Google Drive API.
2. Configure Google Auth branding, audience, support contact and consent information. While testing an external app, add the intended accounts as test users. Complete any verification or policy requirements Google applies before public distribution.
3. Create an OAuth client of type **Desktop app**. Download its client JSON (the top-level object is `installed`). Do not use a Web application or Chrome extension client.
4. In KRYLT, open **Passwords → Configure Google OAuth…**, select that JSON, then choose **Sign in with Google**.
5. Authorization must open in an external system browser, not a KRYLT embedded panel. If KRYLT later becomes the system default, provide an approved external authentication host before enabling this feature there.
6. Consent requests OpenID/email and `https://www.googleapis.com/auth/drive.appdata`. Confirm the connected account displayed in KRYLT.
7. Create or unlock a local vault. Choose **Back up encrypted vault** to create a new snapshot. Find cloud backups to select and restore one using its vault passphrase.

The runtime constructs Google's authorization/token/API endpoints itself; endpoint values in the downloaded configuration are ignored. OAuth uses state, nonce, PKCE S256, a random loopback port on 127.0.0.1, and verified ID tokens. Sign-in has a three-minute callback timeout; Google requests have network timeouts. Desktop client identifiers/configuration identify the application and are not a substitute for vault encryption.

## Backup behavior

- Vault ciphertext is uploaded to Drive's private `appDataFolder`.
- Each backup is a new file with KRYLT app metadata; uploads do not overwrite earlier snapshots.
- The UI lists up to the latest 30 matching files. This version does not delete or rotate old cloud backups.
- Restore replaces the local encrypted vault after authentication/decryption and explicit confirmation. It does not merge entries. Export a local encrypted backup first if you need to preserve current entries.
- OAuth tokens are memory-only and are discarded on disconnect or exit. Reconnect after restarting or if authorization expires. Disconnect does not revoke the consent grant in the Google account.
- Google sign-in identifies the account. The backup's vault passphrase is still needed to decrypt it.
- There is no recovery bypass. Losing the passphrase means losing access to that vault even if its encrypted backup is present in Google Drive.
- This is manual backup/restore, not continuous multi-device password synchronization.

## Production release requirements

Before handling real users' credentials: complete independent security review of vault/IPC/form integration, test all supported OSes, exercise real OAuth success/cancellation/revocation/account switching, confirm current Google policy compliance, and supply signed distribution and a maintained update pipeline. Do not market this development build as an audited password manager.

## References

https://developers.google.com/identity/protocols/oauth2/native-app
https://developers.google.com/workspace/drive/api/guides/appdata
