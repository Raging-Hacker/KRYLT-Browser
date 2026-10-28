param([Parameter(Mandatory=$true)][string]$InstallDirectory)
$ErrorActionPreference = 'Stop'
$directory = [IO.Path]::GetFullPath($InstallDirectory).TrimEnd('\')
$forbidden = @([IO.Path]::GetPathRoot($directory).TrimEnd('\'),$env:WINDIR,$env:ProgramFiles,${env:ProgramFiles(x86)},$env:USERPROFILE,$env:APPDATA,$env:LOCALAPPDATA) | Where-Object { $_ }
if ($forbidden -contains $directory) { throw 'Choose a dedicated KRYLT installation folder.' }
if (-not (Test-Path -LiteralPath $directory)) { exit 0 }
$item = Get-Item -LiteralPath $directory -Force
if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'The installation folder must not be a directory junction.' }
$marker = Join-Path $directory '.krylt-install'
$owned = (Test-Path -LiteralPath $marker -PathType Leaf) -and ((Get-Content -LiteralPath $marker -Raw) -eq 'KRYLT by Cyclonix Designs')
$legacy = ((Test-Path -LiteralPath (Join-Path $directory 'KRYLT.exe')) -or (Test-Path -LiteralPath (Join-Path $directory 'Tempest Ultra.exe'))) -and (Test-Path -LiteralPath (Join-Path $directory 'resources\app.asar'))
foreach ($process in @(Get-Process -Name 'KRYLT','Tempest Ultra' -ErrorAction SilentlyContinue)) {
  if ($process.Path -and ([IO.Path]::GetDirectoryName($process.Path) -eq $directory)) { throw 'Close the existing browser before installing.' }
}
$children = @(Get-ChildItem -LiteralPath $directory -Force)
if (-not $owned -and -not $legacy) {
  if ($children.Count) { throw 'Choose an empty folder or a recognized KRYLT installation. Unrelated files will not be removed.' }
  exit 0
}
function Remove-OwnedTree([string]$Path) {
  $entry = Get-Item -LiteralPath $Path -Force
  if ($entry.PSIsContainer) {
    # Delete directory links themselves without walking into their targets.
    if (-not ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      foreach ($child in @(Get-ChildItem -LiteralPath $Path -Force)) { Remove-OwnedTree $child.FullName }
    }
    [IO.Directory]::Delete($Path)
  } else { Remove-Item -LiteralPath $Path -Force }
}
foreach ($child in $children) {
  # The builder invokes the registered uninstaller next; keep that executable
  # available until it has removed the previous installation record.
  if ($child.Name -in @('Uninstall KRYLT.exe','Uninstall Tempest Ultra.exe')) { continue }
  Remove-OwnedTree $child.FullName
}
