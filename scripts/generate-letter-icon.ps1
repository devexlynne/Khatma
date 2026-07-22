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

$cream = [System.Drawing.ColorTranslator]::FromHtml("#FFF9F0")
$letterBrush = [System.Drawing.SolidBrush]::new($cream)
$letterPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$letterPath.AddLine(335, 160, 390, 160)
$letterPath.AddLine(390, 160, 390, 300)
$letterPath.AddBezier(390, 300, 390, 392, 337, 440, 260, 440)
$letterPath.AddBezier(260, 440, 170, 440, 125, 390, 125, 310)
$letterPath.AddBezier(125, 310, 125, 265, 140, 225, 175, 190)
$letterPath.AddLine(175, 190, 215, 230)
$letterPath.AddBezier(215, 230, 190, 255, 185, 280, 185, 310)
$letterPath.AddBezier(185, 310, 185, 355, 210, 380, 260, 380)
$letterPath.AddBezier(260, 380, 307, 380, 330, 355, 330, 300)
$letterPath.AddLine(330, 300, 330, 165)
$letterPath.AddBezier(330, 165, 330, 162, 332, 160, 335, 160)
$letterPath.CloseFigure()
$graphics.FillPath($letterBrush, $letterPath)

$dotPath = [System.Drawing.Drawing2D.GraphicsPath]::new()
$dotPath.AddPolygon([System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new(260, 95),
  [System.Drawing.PointF]::new(292, 127),
  [System.Drawing.PointF]::new(260, 159),
  [System.Drawing.PointF]::new(228, 127)
))
$graphics.FillPath($letterBrush, $dotPath)

$path512 = Join-Path $public "noor-clean-512.png"
$bitmap.Save($path512, [System.Drawing.Imaging.ImageFormat]::Png)

$maskable = [System.Drawing.Bitmap]::new($size, $size)
$maskableGraphics = [System.Drawing.Graphics]::FromImage($maskable)
$maskableGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#6B21A8"))
$maskableGraphics.DrawImage($bitmap, 0, 0, $size, $size)
$maskable.Save((Join-Path $public "noor-clean-maskable-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$small = [System.Drawing.Bitmap]::new(192, 192)
$smallGraphics = [System.Drawing.Graphics]::FromImage($small)
$smallGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$smallGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$smallGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$smallGraphics.DrawImage($bitmap, 0, 0, 192, 192)
$small.Save((Join-Path $public "noor-clean-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$smallGraphics.Dispose()
$small.Dispose()
$maskableGraphics.Dispose()
$maskable.Dispose()
$letterBrush.Dispose()
$dotPath.Dispose()
$letterPath.Dispose()
$motifPen.Dispose()
$gold.Dispose()
$inner.Dispose()
$gradient.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
