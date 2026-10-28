# Publish an unsigned development prerelease from this repository checkout.
param(
  [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
  [string]$Repository = 'Raging-Hacker/KRYLT-Browser',
  [string]$AssetsDirectory = 'dist',
  [switch]$Build
)
$ErrorActionPreference = 'Stop'
function Invoke-Checked {
  param([string]$Exe, [string[]]$ArgList)
  & $Exe @ArgList
  if ($LASTEXITCODE -ne 0) { throw "$Exe failed ($LASTEXITCODE). Publishing stopped." }
}
Get-Command git, gh, npm -ErrorAction Stop | Out-Null
Push-Location $PSScriptRoot
try {
  $version = (Get-Content package.json -Raw | ConvertFrom-Json).version
  if ($version -notmatch '^\d+\.\d+\.\d+-[A-Za-z0-9.-]+$') { throw 'This helper publishes prereleases only. Use release:win for signed stable releases.' }
  Invoke-Checked gh @('auth','status','--hostname','github.com')
  Invoke-Checked npm @('run','check')
  Invoke-Checked npm @('test')
  if ($Build) { Invoke-Checked npm @('run','dist:win') }
  $assets = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot $AssetsDirectory))
  $installer = "KRYLT-$version-Setup-x64.exe"
  $files = @((Join-Path $assets $installer),(Join-Path $assets ($installer+'.blockmap')))
  foreach ($file in $files) { if (-not (Test-Path -LiteralPath $file -PathType Leaf)) { throw "Missing release asset: $file. Run npm run dist:win or pass -Build." } }
  $sums = Join-Path $assets 'SHA256SUMS.txt'
  $lines = foreach ($file in $files) { (Get-FileHash -Algorithm SHA256 -LiteralPath $file).Hash.ToLowerInvariant() + '  ' + [IO.Path]::GetFileName($file) }
  [IO.File]::WriteAllLines($sums,$lines,[Text.UTF8Encoding]::new($false))
  $tag = "v$version"
  & gh release view $tag --repo $Repository *> $null
  if ($LASTEXITCODE -eq 0) { throw "$tag already exists. Existing release assets will not be overwritten." }
  $commit = & git rev-parse HEAD
  if ($LASTEXITCODE -ne 0) { throw 'Publish from a git checkout whose commit has been pushed to GitHub.' }
  Invoke-Checked gh @('release','create',$tag,$files[0],$files[1],$sums,'--repo',$Repository,'--target',$commit,'--title',"KRYLT $version",'--notes-file',(Join-Path $PSScriptRoot 'ReleaseNotes.md'),'--prerelease')
  Write-Output "Published https://github.com/$Repository/releases/tag/$tag"
} finally { Pop-Location }
