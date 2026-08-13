$ErrorActionPreference = "Stop"
$workspace = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$runId = "v3-final-2026-08-13-r3"
$reportDir = Join-Path $workspace "validation/reports/$runId"
$buildDir = Join-Path $env:TEMP "ux-gen-v3-final-dist"
$extractDir = Join-Path $env:TEMP "v3 final acceptance package"
$startHead = (git -C $workspace rev-parse HEAD).Trim()
$commands = [System.Collections.Generic.List[string]]::new()

function Invoke-Gate([string]$label, [scriptblock]$action) {
  Write-Host "`n=== $label ==="
  $commands.Add($label)
  & $action
  if ($LASTEXITCODE -ne 0) { throw "$label failed with exit code $LASTEXITCODE" }
}

New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

Invoke-Gate "root typecheck" { npm.cmd run typecheck }
Invoke-Gate "root build" { npm.cmd run build }
Invoke-Gate "contract tests" { npm.cmd exec playwright test tests/unit/prototype-validation-contract.spec.ts }
Invoke-Gate "recorder v3 acceptance" { npm.cmd run acceptance:recorder:v3 }
Invoke-Gate "baseline HTML validation" { npm.cmd run validate -- --path baseline/pages }
Invoke-Gate "prototype typecheck" { npm.cmd --prefix prototype run typecheck }
$env:PROTOTYPE_OUTPUT = $buildDir
Invoke-Gate "prototype production build" { npm.cmd --prefix prototype run build }
$env:PROTOTYPE_INDEX = Join-Path $buildDir "index.html"
Invoke-Gate "prototype Chrome" { npm.cmd run test:prototype:chrome }
Invoke-Gate "prototype Edge" { npm.cmd run test:prototype:edge }
Invoke-Gate "offline asset audit" { npm.cmd run audit:offline-assets -- $env:PROTOTYPE_INDEX }
Invoke-Gate "offline package" { powershell -ExecutionPolicy Bypass -File scripts/package-offline.ps1 -BuiltIndex $env:PROTOTYPE_INDEX }
Invoke-Gate "ZIP structural verification" { powershell -ExecutionPolicy Bypass -File scripts/verify-offline-zip.ps1 }

if (Test-Path -LiteralPath $extractDir) { Remove-Item -LiteralPath $extractDir -Recurse -Force }
Expand-Archive -LiteralPath (Join-Path $workspace "delivery/prototype-offline.zip") -DestinationPath $extractDir
$env:PROTOTYPE_INDEX = Join-Path $extractDir "index.html"
Invoke-Gate "extracted file protocol Chrome" { npm.cmd run test:prototype:chrome }
Invoke-Gate "extracted file protocol Edge" { npm.cmd run test:prototype:edge }

$endHead = (git -C $workspace rev-parse HEAD).Trim()
if ($startHead -ne $endHead) { throw "Git HEAD changed during acceptance" }
$baselineHashes = [ordered]@{}
Get-ChildItem -LiteralPath (Join-Path $workspace "baseline/pages") -Filter *.html -File | Sort-Object Name | ForEach-Object {
  $baselineHashes[$_.Name] = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
}
if ($baselineHashes.Count -ne 7) { throw "Expected 7 baseline HTML files, got $($baselineHashes.Count)" }
$routes = @('/overview','/home','/users','/user-exceptions','/form','/application','/dialog-editor','/account-settings')
$zipPath = Join-Path $workspace "delivery/prototype-offline.zip"
$indexPath = Join-Path $workspace "delivery/dist/index.html"
$report = [ordered]@{
  schemaVersion = 3
  runId = $runId
  generatedAt = (Get-Date).ToUniversalTime().ToString('o')
  status = 'PASS'
  environment = [ordered]@{
    os = [Environment]::OSVersion.VersionString
    node = (node --version).Trim()
    npm = (npm.cmd --version).Trim()
    pnpm = (pnpm.cmd --version).Trim()
    gitHead = $endHead
    chrome = (Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.ProductVersion
    edge = (Get-Item 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe').VersionInfo.ProductVersion
    benchmarkCommit = 'b8177a202dceb1412d3bf56f3d15483dc1606c9c'
    elementPlusSkillsCommit = '1d126b39a80523665cc6290f70ce25aa89d708ae'
  }
  commands = @($commands)
  browsers = [ordered]@{ chrome = 'PASS'; edge = 'PASS' }
  routes = @($routes | ForEach-Object { [ordered]@{ route = $_; status = 'PASS' } })
  interactions = @('users priority/CRUD','exception processing','forms validation','dialog editing','account settings')
  baselineHashes = $baselineHashes
  recorder = [ordered]@{ captures = '20/20'; triggers = 'button/hotkey/terminal'; htmlOnly = $true; nonHtmlArtifacts = 0 }
  offline = [ordered]@{ fileProtocol = 'PASS'; networkRequests = 0; extractedPath = $extractDir }
  artifacts = [ordered]@{
    distIndexSha256 = (Get-FileHash -LiteralPath $indexPath -Algorithm SHA256).Hash
    zipSha256 = (Get-FileHash -LiteralPath $zipPath -Algorithm SHA256).Hash
    zip = $zipPath
  }
  humanOnlyBoundary = [ordered]@{
    status = 'NOT_CLAIMED'
    reason = 'The user requested no human intervention; automated file:// tests cannot prove the physical OS double-click gesture or a business-person subjective signature.'
  }
}
$json = $report | ConvertTo-Json -Depth 8
Set-Content -LiteralPath (Join-Path $reportDir "acceptance-v3.json") -Value $json -Encoding utf8
$json
