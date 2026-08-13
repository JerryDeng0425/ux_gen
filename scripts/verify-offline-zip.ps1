param([string]$ZipPath = "delivery/prototype-offline.zip")

$ErrorActionPreference = "Stop"
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$zip = [System.IO.Path]::GetFullPath((Join-Path $workspace $ZipPath))
if (-not $zip.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) { throw "ZIP path escapes workspace" }
if (-not (Test-Path -LiteralPath $zip -PathType Leaf)) { throw "ZIP does not exist: $zip" }

Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::OpenRead($zip)
try {
  $entries = @($archive.Entries | ForEach-Object { $_.FullName })
  if ($entries -notcontains "index.html") { throw "Root index.html missing" }
  foreach ($entry in $entries) {
    if ([System.IO.Path]::IsPathRooted($entry) -or $entry -match '(^|/|\\)\.\.(/|\\|$)') { throw "Unsafe archive entry: $entry" }
    if ($entry -notin @("index.html", "README.txt") -and -not $entry.StartsWith("assets/")) { throw "Unexpected archive entry: $entry" }
  }
} finally {
  $archive.Dispose()
}

[pscustomobject]@{
  passed = $true
  zip = $zip
  zipSha256 = (Get-FileHash -LiteralPath $zip -Algorithm SHA256).Hash
  entries = $entries
} | ConvertTo-Json -Depth 4
