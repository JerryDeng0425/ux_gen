param(
  [Parameter(Mandatory = $true)][string]$BuiltIndex,
  [string]$DeliveryRoot = "delivery",
  [string]$ZipName = "prototype-offline.zip"
)

$ErrorActionPreference = "Stop"
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$delivery = [System.IO.Path]::GetFullPath((Join-Path $workspace $DeliveryRoot))
if (-not $delivery.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Delivery path escapes workspace" }
$source = [System.IO.Path]::GetFullPath($BuiltIndex)
if (-not (Test-Path -LiteralPath $source -PathType Leaf)) { throw "Built index does not exist: $source" }

$dist = Join-Path $delivery "dist"
$zip = Join-Path $delivery $ZipName
New-Item -ItemType Directory -Path $dist -Force | Out-Null
Copy-Item -LiteralPath $source -Destination (Join-Path $dist "index.html") -Force

$readme = @(
  "PureAdmin offline high-fidelity prototype",
  "",
  "1. Extract this ZIP to any local folder.",
  "2. Double-click the root index.html with Chrome or Edge.",
  "3. Node.js, command line, HTTP server and network access are not required.",
  "4. Use the left menu to open every Hash route."
) -join [Environment]::NewLine
Set-Content -LiteralPath (Join-Path $dist "README.txt") -Value $readme -Encoding UTF8

if (Test-Path -LiteralPath $zip) { Remove-Item -LiteralPath $zip -Force }
Compress-Archive -LiteralPath (Join-Path $dist "index.html"), (Join-Path $dist "README.txt") -DestinationPath $zip -CompressionLevel Optimal

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName })
  if ($entries -notcontains "index.html") { throw "ZIP root index.html missing" }
  foreach ($entry in $entries) {
    if ([System.IO.Path]::IsPathRooted($entry) -or $entry -match '(^|/|\\)\.\.(/|\\|$)') { throw "Unsafe archive entry: $entry" }
    if ($entry -notin @("index.html", "README.txt") -and -not $entry.StartsWith("assets/")) { throw "Archive entry is outside whitelist: $entry" }
  }
} finally {
  $archive.Dispose()
}

$indexHash = (Get-FileHash (Join-Path $dist "index.html") -Algorithm SHA256).Hash
$zipHash = (Get-FileHash $zip -Algorithm SHA256).Hash
[pscustomobject]@{
  index = (Join-Path $dist "index.html")
  indexSha256 = $indexHash
  zip = $zip
  zipSha256 = $zipHash
  entries = $entries
} | ConvertTo-Json -Depth 4
