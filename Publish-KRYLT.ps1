# Publishes the public download page and an unsigned development prerelease.
# Requires Git and GitHub CLI. Authenticate locally with: gh auth login
param(
  [ValidatePattern('^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$')]
  [string]$Repository = 'Raging-Hacker/KRYLT-Browser'
)
$ErrorActionPreference = 'Stop'
function Invoke-Checked {
  param([string]$Exe, [string[]]$ArgList)
  & $Exe @ArgList
  if ($LASTEXITCODE -ne 0) { throw "$Exe failed ($LASTEXITCODE). Publishing stopped." }
}
Get-Command git, gh -ErrorAction Stop | Out-Null
$tag = 'v3.0.0-dev.8'
$installer = 'KRYLT-3.0.0-dev.8-Setup-x64.exe'
$assets = Join-Path $PSScriptRoot 'ReleaseAssets'
$expected = @($installer, ($installer + '.blockmap'))
$checksums = @(Get-Content -LiteralPath (Join-Path $assets 'SHA256SUMS.txt'))
if ($checksums.Count -ne 2) { throw 'Expected installer and blockmap checksums.' }
$seen = @()
foreach ($line in $checksums) {
  if ($line -notmatch '^([a-f0-9]{64})  ([A-Za-z0-9._-]+)$') { throw 'Invalid checksum entry.' }
  $hash = $Matches[1]; $name = $Matches[2]
  if ($name -notin $expected -or $name -in $seen) { throw 'Unexpected or repeated checksum filename.' }
  if ((Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $assets $name)).Hash.ToLowerInvariant() -ne $hash) {
    throw "Checksum mismatch: $name"
  }
  $seen += $name
}
Invoke-Checked gh @('auth', 'status', '--hostname', 'github.com')
& gh release view $tag --repo $Repository *> $null
if ($LASTEXITCODE -eq 0) { throw "$tag already exists. Existing release files will not be overwritten." }
$login = & gh api user --jq '.login'
if ($LASTEXITCODE -ne 0 -or $login -notmatch '^[A-Za-z0-9-]+$') { throw 'Could not resolve the authenticated GitHub account.' }
$accountId = & gh api user --jq '.id'
if ($LASTEXITCODE -ne 0 -or $accountId -notmatch '^\d+$') { throw 'Could not resolve the GitHub account ID.' }
$checkout = Join-Path ([IO.Path]::GetTempPath()) ('krylt-publish-' + [Guid]::NewGuid().ToString('N'))
Invoke-Checked gh @('repo', 'clone', "https://github.com/$Repository", $checkout, '--', '--single-branch', '--branch', 'main')
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Repository/README.md') -Destination (Join-Path $checkout 'README.md') -Force
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Repository/.gitignore') -Destination (Join-Path $checkout '.gitignore') -Force
New-Item -ItemType Directory -Path (Join-Path $checkout 'assets') -Force | Out-Null
Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'Repository/assets/logo.png') -Destination (Join-Path $checkout 'assets/logo.png') -Force
$readmePath = Join-Path $checkout 'README.md'
$readme = [IO.File]::ReadAllText($readmePath).Replace('Raging-Hacker/KRYLT-Browser', $Repository)
[IO.File]::WriteAllText($readmePath, $readme, [Text.UTF8Encoding]::new($false))
Invoke-Checked git @('-C', $checkout, 'add', '--', 'README.md', '.gitignore', 'assets/logo.png')
& git -C $checkout diff --cached --quiet
$diffResult = $LASTEXITCODE
if ($diffResult -eq 1) {
  $email = "$accountId+$login@users.noreply.github.com"
  Invoke-Checked git @('-C', $checkout, '-c', "user.name=$login", '-c', "user.email=$email", 'commit', '-m', 'Rebrand browser downloads as KRYLT')
} elseif ($diffResult -ne 0) { throw 'Could not inspect staged repository changes.' }
Invoke-Checked git @('-C', $checkout, '-c', 'credential.helper=!gh auth git-credential', 'push', 'origin', 'main')
Invoke-Checked gh @('repo', 'edit', $Repository, '--description', 'KRYLT browser - official downloads and updates by Cyclonix Designs.')
$setup = Join-Path $assets $installer
$blockmap = Join-Path $assets ($installer + '.blockmap')
$sums = Join-Path $assets 'SHA256SUMS.txt'
Invoke-Checked gh @('release', 'create', $tag, $setup, $blockmap, $sums, '--repo', $Repository, '--target', 'main', '--title', 'KRYLT 3.0.0-dev.8', '--notes-file', (Join-Path $PSScriptRoot 'ReleaseNotes.md'), '--prerelease')
Write-Output "Published KRYLT download page and prerelease: https://github.com/$Repository/releases/tag/$tag"
Write-Output "Local checkout retained at: $checkout"
