$ErrorActionPreference = 'Stop'
$metadataUrl = 'https://github.com/Bakobiibizo/harbor/releases/latest/download/latest.json'
$metadata = Invoke-RestMethod -Uri $metadataUrl
$asset = $metadata.platforms.'windows-x86_64-nsis'
if (-not $asset.url) { throw 'The latest Harbor release does not include a Windows x64 installer.' }
$installer = Join-Path $env:TEMP 'harbor-latest-setup.exe'
Invoke-WebRequest -Uri $asset.url -OutFile $installer
Write-Host "Launching the Harbor $($metadata.version) installer..."
Start-Process -FilePath $installer -Wait
