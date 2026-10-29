# Runs only in the disposable Windows CI runner after compiling the installer.
$ErrorActionPreference = 'Stop'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('krylt-lifecycle-' + [Guid]::NewGuid().ToString('N'))
$install = Join-Path $fixture 'KRYLT Test Installation'
$profile = Join-Path $env:APPDATA 'tempest-ultra'
$cache = Join-Path $env:LOCALAPPDATA 'krylt-updater'
if ((Test-Path $profile) -or (Test-Path $cache)) { throw 'Lifecycle test requires a clean disposable Windows user.' }
$version = (Get-Content (Join-Path $PSScriptRoot '..\package.json') -Raw | ConvertFrom-Json).version
$setup = Join-Path $PSScriptRoot "..\dist\KRYLT-$version-Setup-x64.exe"
function Assert-True([bool]$Condition,[string]$Message) { if (-not $Condition) { throw $Message } }
try {
  $first = Start-Process -FilePath $setup -ArgumentList @('/S',"/D=$install") -Wait -PassThru
  Assert-True ($first.ExitCode -eq 0) 'Fresh installation failed'
  Write-Output ('Requested installation directory: ' + $install)
  Get-ChildItem -LiteralPath $fixture -Force -Recurse -ErrorAction SilentlyContinue | Select-Object -First 8 FullName
  Get-ItemProperty 'HKLM:\Software\Microsoft\Windows\CurrentVersion\App Paths\KRYLT.exe' -ErrorAction SilentlyContinue | Select-Object '(default)'
  Assert-True (Test-Path (Join-Path $install 'KRYLT.exe')) 'Application EXE is missing'
  Assert-True (Test-Path (Join-Path $install '.krylt-install')) 'Installation ownership marker is missing'
  Assert-True ((Get-ItemProperty 'HKLM:\Software\RegisteredApplications').KRYLT -ne $null) 'Browser registration is missing'
  New-Item -ItemType Directory -Path $profile,$cache -Force | Out-Null
  [IO.File]::WriteAllText((Join-Path $profile 'password-vault.json'),'encrypted-vault-fixture')
  [IO.File]::WriteAllText((Join-Path $cache 'fixture'),'cached-installer-fixture')
  [IO.File]::WriteAllText((Join-Path $install 'obsolete-runtime.txt'),'stale')
  $upgrade = Start-Process -FilePath $setup -ArgumentList @('/S',"/D=$install") -Wait -PassThru
  Assert-True ($upgrade.ExitCode -eq 0) 'In-place installation failed'
  Assert-True (-not (Test-Path (Join-Path $install 'obsolete-runtime.txt'))) 'Old program files survived replacement'
  Assert-True (Test-Path (Join-Path $profile 'password-vault.json')) 'Upgrade deleted the vault'
  $keep = Start-Process -FilePath (Join-Path $install 'Uninstall KRYLT.exe') -ArgumentList '/S' -Wait -PassThru
  Assert-True ($keep.ExitCode -eq 0) 'Keep-data uninstall failed'
  for ($attempt=0; $attempt -lt 100 -and (Test-Path (Join-Path $install 'KRYLT.exe')); $attempt++) { Start-Sleep -Milliseconds 100 }
  Assert-True (Test-Path (Join-Path $profile 'password-vault.json')) 'Keep-data uninstall deleted the vault'
  $again = Start-Process -FilePath $setup -ArgumentList @('/S',"/D=$install") -Wait -PassThru
  Assert-True ($again.ExitCode -eq 0) 'Reinstall after keeping data failed'
  $uninstall = Start-Process -FilePath (Join-Path $install 'Uninstall KRYLT.exe') -ArgumentList '/S /REMOVEUSERDATA' -Wait -PassThru
  Assert-True ($uninstall.ExitCode -eq 0) 'Explicit uninstall failed'
  for ($attempt=0; $attempt -lt 100 -and (Test-Path (Join-Path $install 'KRYLT.exe')); $attempt++) { Start-Sleep -Milliseconds 100 }
  Assert-True (-not (Test-Path (Join-Path $install 'KRYLT.exe'))) 'Uninstall retained the runtime'
  Assert-True (-not (Test-Path $profile)) 'Uninstall retained the password vault/profile'
  Assert-True (-not (Test-Path $cache)) 'Uninstall retained the updater cache'
  $registered = Get-ItemProperty 'HKLM:\Software\RegisteredApplications' -ErrorAction SilentlyContinue
  Assert-True ($null -eq $registered.KRYLT) 'Uninstall retained browser registration'
  Write-Output 'Windows install, replacement and full app-data uninstall passed.'
} finally {
  if (Test-Path $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force -ErrorAction SilentlyContinue }
  if (Test-Path $profile) { Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue }
  if (Test-Path $cache) { Remove-Item -LiteralPath $cache -Recurse -Force -ErrorAction SilentlyContinue }
}

exit 0
