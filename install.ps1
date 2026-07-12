$ErrorActionPreference = 'Stop'
$releasesUrl = 'https://api.github.com/repos/Bakobiibizo/harbor/releases?per_page=20'
$releases = Invoke-RestMethod -Uri $releasesUrl
$release = $releases | Where-Object { $_.tag_name -ne 'updater-channel' -and ($_.assets.name -match '_x64-setup\.exe$') } | Select-Object -First 1
$asset = $release.assets | Where-Object { $_.name -match '_x64-setup\.exe$' } | Select-Object -First 1
if (-not $asset.browser_download_url) { throw 'No published Windows x64 installer is currently available.' }
$installer = Join-Path $env:TEMP 'harbor-latest-setup.exe'
Invoke-WebRequest -Uri $asset.browser_download_url -OutFile $installer
Write-Host "Launching the Harbor $($release.tag_name) installer..."
Start-Process -FilePath $installer -Wait
