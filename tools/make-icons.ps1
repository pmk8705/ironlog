# IronLog app icons: navy background + white dumbbell (kept inside the maskable safe zone)
# Usage (project folder): powershell -ExecutionPolicy Bypass -File tools/make-icons.ps1
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'icons'
New-Item -ItemType Directory -Force $out | Out-Null

function New-Icon([int]$size, [string]$path) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(31, 42, 68))
  $s = $size / 512.0
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $orange = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(242, 113, 28))
  function Add-Box($x, $y, $w, $h, $b) {
    $rect = New-Object System.Drawing.RectangleF ([float]($x * $s)), ([float]($y * $s)), ([float]($w * $s)), ([float]($h * $s))
    $r = [float](12 * $s)
    $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
    $gp.AddArc($rect.X, $rect.Y, $r * 2, $r * 2, 180, 90)
    $gp.AddArc($rect.Right - $r * 2, $rect.Y, $r * 2, $r * 2, 270, 90)
    $gp.AddArc($rect.Right - $r * 2, $rect.Bottom - $r * 2, $r * 2, $r * 2, 0, 90)
    $gp.AddArc($rect.X, $rect.Bottom - $r * 2, $r * 2, $r * 2, 90, 90)
    $gp.CloseFigure()
    $g.FillPath($b, $gp)
  }
  # bar
  Add-Box 150 238 212 36 $white
  # plates (left)
  Add-Box 118 176 40 160 $white
  Add-Box 160 200 30 112 $white
  # plates (right)
  Add-Box 354 176 40 160 $white
  Add-Box 322 200 30 112 $white
  # small accent line under the dumbbell
  Add-Box 196 360 120 18 $orange
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

New-Icon 192 (Join-Path $out 'icon-192.png')
New-Icon 512 (Join-Path $out 'icon-512.png')
Write-Output 'icons done'
