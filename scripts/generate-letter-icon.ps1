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
  [System.Drawing.ColorTranslator]::FromHtml("#23835F"),
  [System.Drawing.ColorTranslator]::FromHtml("#11543D"),
  135
)
$graphics.FillPath($gradient, $outer)

$inner = New-RoundedPath 18 18 476 476 96
$gold = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(210, 221, 178, 82), 6)
$graphics.DrawPath($gold, $inner)

$motifPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(48, 255, 255, 255), 3)
for ($offset = 62; $offset -le 450; $offset += 64) {
  $graphics.DrawLine($motifPen, 34, $offset, 58, $offset - 24)
  $graphics.DrawLine($motifPen, 58, $offset - 24, 82, $offset)
  $graphics.DrawLine($motifPen, 430, $offset, 454, $offset - 24)
  $graphics.DrawLine($motifPen, 454, $offset - 24, 478, $offset)
}

$font = [System.Drawing.Font]::new("Traditional Arabic", 292, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$format = [System.Drawing.StringFormat]::new()
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$format.FormatFlags = [System.Drawing.StringFormatFlags]::DirectionRightToLeft
$textBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
$graphics.DrawString("ن", $font, $textBrush, [System.Drawing.RectangleF]::new(46, 38, 420, 420), $format)

$path512 = Join-Path $public "noor-letter-512.png"
$bitmap.Save($path512, [System.Drawing.Imaging.ImageFormat]::Png)

$maskable = [System.Drawing.Bitmap]::new($size, $size)
$maskableGraphics = [System.Drawing.Graphics]::FromImage($maskable)
$maskableGraphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#11543D"))
$maskableGraphics.DrawImage($bitmap, 0, 0, $size, $size)
$maskable.Save((Join-Path $public "noor-letter-maskable-512.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$small = [System.Drawing.Bitmap]::new(192, 192)
$smallGraphics = [System.Drawing.Graphics]::FromImage($small)
$smallGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$smallGraphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$smallGraphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$smallGraphics.DrawImage($bitmap, 0, 0, 192, 192)
$small.Save((Join-Path $public "noor-letter-192.png"), [System.Drawing.Imaging.ImageFormat]::Png)

$smallGraphics.Dispose()
$small.Dispose()
$maskableGraphics.Dispose()
$maskable.Dispose()
$textBrush.Dispose()
$format.Dispose()
$font.Dispose()
$motifPen.Dispose()
$gold.Dispose()
$inner.Dispose()
$gradient.Dispose()
$outer.Dispose()
$graphics.Dispose()
$bitmap.Dispose()
