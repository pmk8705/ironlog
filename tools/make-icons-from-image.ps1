# Build app icons from a square design image (e.g. Gemini PNG/WebP, 1024x1024).
# Usage (project folder):
#   powershell -ExecutionPolicy Bypass -File tools/make-icons-from-image.ps1 -Source design/icon-source.webp
# Options: -CropX/-CropY/-CropSize = square area to cut out of the source (pixels).
#          -MaskScale = emblem size inside the maskable icon (Android shapes cut the edges).
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [int]$CropX = 196, [int]$CropY = 196, [int]$CropSize = 632,
  [double]$MaskScale = 0.80
)
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'icons'
New-Item -ItemType Directory -Force $out | Out-Null

# decode with Windows Imaging (reads PNG, JPG and WebP), hand over to System.Drawing as PNG
$fs = [IO.File]::OpenRead((Resolve-Path $Source))
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, 'None', 'OnLoad')
$enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$enc.Frames.Add($dec.Frames[0])
$ms = New-Object IO.MemoryStream
$enc.Save($ms); $fs.Close()
$src = [System.Drawing.Bitmap]::FromStream($ms)

# background colour = average of the crop border (used to fill the maskable padding)
$r = 0; $g = 0; $b = 0; $n = 0
for ($t = 0; $t -lt $CropSize; $t += 8) {
  $xs = @(($CropX + $t), ($CropX + $t), ($CropX + 2), ($CropX + $CropSize - 3))
  $ys = @(($CropY + 2), ($CropY + $CropSize - 3), ($CropY + $t), ($CropY + $t))
  for ($k = 0; $k -lt 4; $k++) {
    $c = $src.GetPixel($xs[$k], $ys[$k]); $r += $c.R; $g += $c.G; $b += $c.B; $n++
  }
}
$bg = [System.Drawing.Color]::FromArgb([int]($r / $n), [int]($g / $n), [int]($b / $n))
"background = $($bg.R),$($bg.G),$($bg.B)"

function Save-Icon([int]$size, [double]$scale, [string]$name) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $gr = [System.Drawing.Graphics]::FromImage($bmp)
  $gr.InterpolationMode = 'HighQualityBicubic'
  $gr.SmoothingMode = 'AntiAlias'
  $gr.PixelOffsetMode = 'HighQuality'
  $gr.Clear($bg)
  $d = [int]($size * $scale); $o = [int](($size - $d) / 2)
  $srcRect = New-Object System.Drawing.Rectangle $CropX, $CropY, $CropSize, $CropSize
  # draw the crop on its own layer first
  $layer = New-Object System.Drawing.Bitmap $d, $d, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $lg = [System.Drawing.Graphics]::FromImage($layer)
  $lg.InterpolationMode = 'HighQualityBicubic'; $lg.PixelOffsetMode = 'HighQuality'
  $lg.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, $d, $d), $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $lg.Dispose()
  if ($scale -lt 1) {
    # fade the outer band to transparent so no square edge shows on the padded icon
    $band = [int]($d * 0.12)
    $rect = New-Object System.Drawing.Rectangle 0, 0, $d, $d
    $data = $layer.LockBits($rect, 'ReadWrite', [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $bytes = New-Object byte[] ($data.Stride * $d)
    [System.Runtime.InteropServices.Marshal]::Copy($data.Scan0, $bytes, 0, $bytes.Length)
    for ($y = 0; $y -lt $d; $y++) {
      $dy = [Math]::Min($y, $d - 1 - $y)
      for ($x = 0; $x -lt $d; $x++) {
        $dx = [Math]::Min($x, $d - 1 - $x)
        $m = [Math]::Min($dx, $dy)
        if ($m -ge $band) { if ($dx -ge $band) { $x = $d - 1 - $band } ; continue }
        $i = $y * $data.Stride + $x * 4 + 3
        $bytes[$i] = [byte]([int]($bytes[$i] * ($m / $band)))
      }
    }
    [System.Runtime.InteropServices.Marshal]::Copy($bytes, 0, $data.Scan0, $bytes.Length)
    $layer.UnlockBits($data)
  }
  $gr.DrawImage($layer, $o, $o, $d, $d)
  $layer.Dispose()
  $bmp.Save((Join-Path $out $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $gr.Dispose(); $bmp.Dispose()
  "saved $name"
}

Save-Icon 512 1.0 'icon-512.png'
Save-Icon 192 1.0 'icon-192.png'
Save-Icon 512 $MaskScale 'icon-maskable-512.png'
$src.Dispose()
