$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Path

$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter *.html

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw

    # Split into head and body parts
    $headMatch = [regex]::Match($content, '(?s)(<head[^>]*>.*?</head>)')
    if (-not $headMatch.Success) {
        Write-Host "No <head> found: $($file.FullName)"
        continue
    }

    $headEnd = $headMatch.Index + $headMatch.Length
    $bodyPart = $content.Substring($headEnd)

    # Remove any password-gate links from the body part
    $cleanBodyPart = $bodyPart -replace '    <link rel="stylesheet" href="(?:\.\./)*assets/css/password-gate\.css">\r?\n', ''
    $cleanBodyPart = $cleanBodyPart -replace '    <script src="(?:\.\./)*assets/js/password-gate\.js"></script>\r?\n', ''

    if ($cleanBodyPart -ne $bodyPart) {
        $content = $content.Substring(0, $headEnd) + $cleanBodyPart
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Removed duplicate password gate links from: $($file.FullName)"
    } else {
        Write-Host "No duplicates in: $($file.FullName)"
    }
}

Write-Host "Done."
