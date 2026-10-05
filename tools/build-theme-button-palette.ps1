# 讀取每個主題的背景圖，縮成小圖取像素，再由 build-theme-button-palette.js 算出按鈕顏色，
# 產生 js/theme-button-palette.js。新增或更換主題背景後重跑：
#   powershell -ExecutionPolicy Bypass -File tools/build-theme-button-palette.ps1
# （背景圖的網站不允許網頁直接讀取像素，所以只能事先在這裡算好。）
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$themes = node tools/build-theme-button-palette.js --list | ConvertFrom-Json
$client = New-Object System.Net.WebClient
$pixels = @{}
foreach ($theme in $themes) {
    if (-not $theme.image) { continue }
    try {
        $bytes = $client.DownloadData($theme.image)
        $stream = New-Object System.IO.MemoryStream (, $bytes)
        $source = [System.Drawing.Image]::FromStream($stream)
        $small = New-Object System.Drawing.Bitmap 48, 48
        $g = [System.Drawing.Graphics]::FromImage($small)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBilinear
        $g.DrawImage($source, 0, 0, 48, 48)
        $list = New-Object System.Collections.Generic.List[int]
        for ($y = 0; $y -lt 48; $y++) { for ($x = 0; $x -lt 48; $x++) {
            $c = $small.GetPixel($x, $y); $list.Add($c.R); $list.Add($c.G); $list.Add($c.B)
        } }
        $pixels[$theme.id] = $list.ToArray()
        $g.Dispose(); $small.Dispose(); $source.Dispose(); $stream.Dispose()
        Write-Host "ok   $($theme.id)"
    } catch {
        Write-Host "fail $($theme.id): $($_.Exception.Message)"
    }
}
$tmp = Join-Path ([System.IO.Path]::GetTempPath()) 'theme-button-pixels.json'
[System.IO.File]::WriteAllText($tmp, ($pixels | ConvertTo-Json -Compress -Depth 3))
node tools/build-theme-button-palette.js --pixels $tmp
