# Explicit uninstall only. Called elevated by NSIS; never called by an upgrade.
$ErrorActionPreference = 'Stop'
$failures = [Collections.Generic.List[string]]::new()
function Remove-OwnedTree([string]$Path) {
  $entry = Get-Item -LiteralPath $Path -Force
  if ($entry.PSIsContainer) {
    if (-not ($entry.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      foreach ($child in @(Get-ChildItem -LiteralPath $Path -Force)) { Remove-OwnedTree $child.FullName }
    }
    [IO.Directory]::Delete($Path)
  } else { Remove-Item -LiteralPath $Path -Force }
}
function Remove-AppDirectory([string]$Root, [string]$Relative) {
  if ([string]::IsNullOrWhiteSpace($Root)) { return }
  $rootPath = [IO.Path]::GetFullPath($Root).TrimEnd('\')
  $target = [IO.Path]::GetFullPath((Join-Path $rootPath $Relative))
  if (-not $target.StartsWith($rootPath + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid cleanup path' }
  if (-not (Test-Path -LiteralPath $target)) { return }
  # Do not traverse redirected profile folders or directory junctions.
  $current = $target
  while ($current.Length -ge $rootPath.Length) {
    $item = Get-Item -LiteralPath $current -Force -ErrorAction SilentlyContinue
    if ($item -and ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
      $failures.Add("Redirected directory requires manual cleanup: $target")
      return
    }
    if ($current -eq $rootPath) { break }
    $current = Split-Path -Parent $current
  }
  try { Remove-OwnedTree $target }
  catch { $failures.Add("Could not remove $target") }
}
$profiles = @(Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList\*' |
  ForEach-Object { [Environment]::ExpandEnvironmentVariables($_.ProfileImagePath) } |
  Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Container) } | Select-Object -Unique)
foreach ($profile in $profiles) {
  foreach ($name in @('tempest-ultra','Tempest Ultra','krylt','KRYLT')) {
    Remove-AppDirectory $profile "AppData\Roaming\$name"
    Remove-AppDirectory $profile "AppData\Local\$name"
  }
  foreach ($name in @('krylt-updater','tempest-ultra-updater','KRYLT-updater','tempest-updater')) {
    Remove-AppDirectory $profile "AppData\Local\$name"
  }
  foreach ($name in @('KRYLT.lnk','Tempest Ultra.lnk')) {
    foreach ($directory in @('Desktop','AppData\Roaming\Microsoft\Windows\Start Menu\Programs')) {
      $link = Join-Path $profile "$directory\$name"
      if (Test-Path -LiteralPath $link) { try { Remove-Item -LiteralPath $link -Force } catch { $failures.Add("Could not remove $link") } }
    }
  }
}
if ($failures.Count) { $failures | Write-Output; exit 1 }
exit 0
