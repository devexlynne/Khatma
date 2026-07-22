Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root "public"

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $radius * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

$size = 512
$bitmap = [System.Drawing.Bitmap]::new($size, $size)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.Color]::Transparent)

$outer = New-RoundedPath 0 0 $size $size 112
$gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
  [System.Drawing.Rectangle]::new(0, 0, $size, $size),
  [System.Drawing.ColorTranslator]::FromHtml("#A855F7"),
  [System.Drawing.ColorTranslator]::FromHtml("#6B21A8"),
  135
)
$graphics.FillPath($gradient, $outer)

$inner = New-RoundedPath 18 18 476 476 96
$gold = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(235, 212, 165, 116), 6)
$graphics.DrawPath($gold, $inner)

$motifPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(42, 255, 249, 240), 3)
for ($offset = 62; $offset -le 450; $offset += 64) {
  $graphics.DrawLine($motifPen, 34, $offset, 58, $offset - 24)
  $graphics.DrawLine($motifPen, 58, $offset - 24, 82, $offset)
  $graphics.DrawLine($motifPen, 430, $offset, 454, $offset - 24)
  $graphics.DrawLine($motifPen, 454, $offset - 24, 478, $offset)
}

$letterPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$letterPath.AddBezier(356, 174, 366, 248, 370, 332, 326, 368)
$letterPath.AddBezier(286, 401, 210, 397, 176, 350, 174, 292)
$letterPath.AddBezier(173, 258, 180, 229, 194, 207, 208, 192)
$cream = [System.Drawing.ColorTranslator]::FromHtml("#FFF9F0")
$letterPen = [System.Drawing.Pen]::new($cream, 58)
$letterPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$letterPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$letterPen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawPath($letterPen, $letterPath)
$dotBrush = [System.Drawing.SolidBrush]::new($cream)
$graphics.FillEllipse($dotBrush, 239, 112, 50, 50)

$path512 = Join-Path $public "noor-app-512.png"
$bitmap.Save($path512, [System.Drawing.Imaging.ImageFormat]::Png)

$maskable = [System.Drawing.Bitmap]::new($size, $size)
$maskableGraphics = [System.Drawing.Graphics]::FromImage($maskable)
$maskableGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#6B21A8"))
$maskableGraphics.DrawImage($bitmap, 0, 0, $size, $size)
$maskable.Save((Join-Path $public "noor-app-maskable-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$small = [System.Drawing.Bitmap]::new(192, 192)
$smallGraphics = [System.Drawing.Graphics]::FromImage($small)
$smallGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$smallGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$smallGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$smallGraphics.DrawImage($bitmap, 0, 0, 192, 192)
$small.Save((Join-Path $public "noor-app-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$smallGraphics.Dispose()
$small.Dispose()
$maskableGraphics.Dispose()
$maskable.Dispose()
$dotBrush.Dispose()
$letterPen.Dispose()
$letterPath.Dispose()
$motifPen.Dispose()
$gold.Dispose()
$inner.Dispose()
$gradient.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
