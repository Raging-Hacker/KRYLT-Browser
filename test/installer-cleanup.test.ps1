$ErrorActionPreference = 'Stop'
$fixture = Join-Path ([IO.Path]::GetTempPath()) ('krylt-cleanup-test-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture | Out-Null
function Assert-True([bool]$Condition,[string]$Message) { if (-not $Condition) { throw $Message } }
try {
  $install = Join-Path $fixture 'app'
  $outside = Join-Path $fixture 'outside'
  New-Item -ItemType Directory -Path $install,$outside | Out-Null
  [IO.File]::WriteAllText((Join-Path $outside 'keep.txt'),'unrelated')
  [IO.File]::WriteAllText((Join-Path $install '.krylt-install'),'KRYLT by Cyclonix Designs')
  [IO.File]::WriteAllText((Join-Path $install 'stale.dll'),'stale')
  [IO.File]::WriteAllText((Join-Path $install 'Uninstall KRYLT.exe'),'keep until builder uninstall')
  New-Item -ItemType Junction -Path (Join-Path $install 'redirect') -Target $outside | Out-Null
  & powershell.exe -NoProfile -NonInteractive -File (Join-Path $PSScriptRoot '..\build\clean-install.ps1') -InstallDirectory $install
  Assert-True ($LASTEXITCODE -eq 0) 'Existing application cleanup failed'
  Assert-True (-not (Test-Path (Join-Path $install 'stale.dll'))) 'Stale runtime file was retained'
  Assert-True (Test-Path (Join-Path $install 'Uninstall KRYLT.exe')) 'Builder uninstaller was removed prematurely'
  Assert-True (Test-Path (Join-Path $outside 'keep.txt')) 'Cleanup followed a junction into unrelated data'
  $unrelated = Join-Path $fixture 'unrelated'
  New-Item -ItemType Directory -Path $unrelated | Out-Null
  [IO.File]::WriteAllText((Join-Path $unrelated 'keep.txt'),'keep')
  $previousPreference = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  & powershell.exe -NoProfile -NonInteractive -File (Join-Path $PSScriptRoot '..\build\clean-install.ps1') -InstallDirectory $unrelated 2>$null
  $rejected = $LASTEXITCODE
  $ErrorActionPreference = $previousPreference
  Assert-True ($rejected -ne 0) 'Cleanup accepted an unrelated nonempty folder'
  Assert-True (Test-Path (Join-Path $unrelated 'keep.txt')) 'Cleanup deleted an unrelated file'
  # Load the cleanup functions without running their real Windows-profile scan.
  $source = [IO.File]::ReadAllText((Join-Path $PSScriptRoot '..\build\clean-profile.ps1'))
  . ([scriptblock]::Create($source.Substring(0,$source.IndexOf('$profiles ='))))
  $profile = Join-Path $fixture 'profile'
  $vault = Join-Path $profile 'AppData\Roaming\tempest-ultra'
  New-Item -ItemType Directory -Path $vault | Out-Null
  [IO.File]::WriteAllText((Join-Path $vault 'password-vault.json'),'encrypted fixture')
  New-Item -ItemType Junction -Path (Join-Path $vault 'linked') -Target $outside | Out-Null
  Remove-AppDirectory $profile 'AppData\Roaming\tempest-ultra'
  Assert-True (-not (Test-Path $vault)) 'Explicit uninstall retained the app profile'
  Assert-True (Test-Path (Join-Path $outside 'keep.txt')) 'Profile cleanup followed a directory junction'
  Write-Output 'Windows cleanup checks passed.'
} finally {
  if (Test-Path $fixture) { Remove-Item -LiteralPath $fixture -Recurse -Force }
}

exit 0
