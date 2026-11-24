# Cut a grid sheet of muscle pictures (e.g. Gemini 4x3 sheet with a label under each) into icons/muscles/*.png
# Usage (project folder):
#   powershell -ExecutionPolicy Bypass -File tools/make-muscle-icons.ps1 -Source design/muscles-sheet.webp
# Order in the sheet (left->right, top->bottom) must match $Names.
param(
  [Parameter(Mandatory = $true)][string]$Source,
  [int]$Cols = 4, [int]$Rows = 3,
  [double]$LabelRatio = 0.17,   # bottom part of each cell that holds the text label (cut off)
  [int]$Inset = 5,              # skip the thin grid lines
  [int]$Size = 192
)
$Names = @('chest', 'back', 'traps', 'lowerback', 'shoulders', 'biceps', 'triceps', 'forearms', 'abs', 'thighs', 'glutes', 'calves')
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$out = Join-Path $root 'icons\muscles'
New-Item -ItemType Directory -Force $out | Out-Null

$fs = [IO.File]::OpenRead((Resolve-Path $Source))
$dec = [System.Windows.Media.Imaging.BitmapDecoder]::Create($fs, 'None', 'OnLoad')
$enc = New-Object System.Windows.Media.Imaging.PngBitmapEncoder
$enc.Frames.Add($dec.Frames[0])
$ms = New-Object IO.MemoryStream
$enc.Save($ms); $fs.Close()
$src = [System.Drawing.Bitmap]::FromStream($ms)
$cw = $src.Width / $Cols; $ch = $src.Height / $Rows
"sheet $($src.Width)x$($src.Height), cell $cw x $ch"

for ($i = 0; $i -lt $Names.Count; $i++) {
  $cx = [int](($i % $Cols) * $cw) + $Inset
  $cy = [int]([Math]::Floor($i / $Cols) * $ch) + $Inset
  $w = [int]($cw - 2 * $Inset)
  $h = [int]($ch * (1 - $LabelRatio) - $Inset)
  $side = [Math]::Max($w, $h)
  $bmp = New-Object System.Drawing.Bitmap $Size, $Size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'; $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::White)
  $scale = $Size / $side
  $dw = [int]($w * $scale); $dh = [int]($h * $scale)
  $dst = New-Object System.Drawing.Rectangle ([int](($Size - $dw) / 2)), ([int](($Size - $dh) / 2)), $dw, $dh
  $g.DrawImage($src, $dst, (New-Object System.Drawing.Rectangle $cx, $cy, $w, $h), [System.Drawing.GraphicsUnit]::Pixel)
  $bmp.Save((Join-Path $out ($Names[$i] + '.png')), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}
$src.Dispose()
'saved ' + $Names.Count + ' icons'
