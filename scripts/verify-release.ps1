param(
  [Parameter(Mandatory=$true)][string]$Directory,
  [Parameter(Mandatory=$true)][string]$ExpectedSubject
)
$ErrorActionPreference = 'Stop'
$setup = @(Get-ChildItem -LiteralPath $Directory -Filter '*-Setup-x64.exe')
if ($setup.Count -ne 1) { throw 'Use a clean dist directory containing exactly one installer.' }
$app = Join-Path $Directory 'win-unpacked\KRYLT.exe'
$uninstaller = Join-Path $Directory '__uninstaller-nsis-krylt.exe'
$files = @($setup[0].FullName, $app)
# The builder normally deletes its signed uninstaller staging file after embedding it.
if (Test-Path -LiteralPath $uninstaller) { $files += $uninstaller }
foreach ($file in $files) {
  $signature = Get-AuthenticodeSignature -LiteralPath $file
  if ($signature.Status -ne 'Valid') { throw "Invalid Authenticode signature: $file" }
  if ([string]$signature.SignatureType -ne 'Authenticode') { throw "Embedded Authenticode signature required: $file" }
  if ($signature.SignerCertificate.Subject -ne $ExpectedSubject) { throw "Certificate subject differs from KRYLT_PUBLISHER_DN: $file" }
  if ($null -eq $signature.TimeStamperCertificate) { throw "Timestamp missing: $file" }
}
foreach ($asset in @((Join-Path $Directory 'latest.yml'), ($setup[0].FullName + '.blockmap'))) {
  if (-not (Test-Path -LiteralPath $asset)) { throw "Missing release asset: $asset" }
}
Write-Output 'Release signatures, publisher, timestamps and asset presence verified.'
