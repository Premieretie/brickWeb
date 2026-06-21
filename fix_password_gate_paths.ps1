$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter *.html

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Substring($ROOT.Length).TrimStart('\', '/')
    $depth = ($relativePath -split '[\/]').Count - 1
    if ($depth -lt 0) { $depth = 0 }
    $prefix = if ($depth -eq 0) { '' } else { ('../' * $depth).TrimEnd('/') + '/' }

    $cssPath = $prefix + 'assets/css/password-gate.css'
    $jsPath = $prefix + 'assets/js/password-gate.js'

    $content = Get-Content -Path $file.FullName -Raw

    # Replace any password gate path with the correct relative path
    $content = $content -replace '<link rel="stylesheet" href="(?:\./)*(?:\.\./)*assets/css/password-gate\.css">', "<link rel=`"stylesheet`" href=`"$cssPath`">"
    $content = $content -replace '<script src="(?:\./)*(?:\.\./)*assets/js/password-gate\.js"></script>', "<script src=`"$jsPath`"></script>"

    Set-Content -Path $file.FullName -Value $content -NoNewline
    Write-Host "Updated: $($file.FullName) -> $cssPath, $jsPath"
}

Write-Host "Done."
