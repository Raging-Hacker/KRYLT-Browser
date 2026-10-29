# KRYLT Alpha version policy

New release train: **1.0.0-alpha.1**.

The version in package.json and package-lock.json is canonical. UI labels
must display the running version dynamically.

For each new Alpha build increment the prerelease counter: alpha.1, alpha.2,
alpha.3. Stable 1.0.0 follows when quality checks and signing are complete.

Note: existing 3.0.0-dev releases have higher version precedence than
1.0.0-alpha.1. A new Alpha track cannot automatically replace these through
the stable updater. Preserve profile data and back it up before manual
replacement. Test installation and upgrade behavior on Windows.

No source commit by itself constitutes a built, signed or tested installer.
