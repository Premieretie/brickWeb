# Windows Server 2019 Setup Guide for BrickQuote Pro

This guide walks through installing and configuring Windows Server 2019 to host the BrickQuote Pro Next.js application behind IIS + ARR, with Cloudflare in front.

Target architecture:

```
Cloudflare → Windows Server 2019 → IIS + ARR → Next.js (localhost:3000) → Supabase
```

---

## Prerequisites

- A Windows Server 2019 instance with a static public IP.
- Administrator access.
- Cloudflare DNS pointed to the server IP (see `cloudflare.md`).
- A valid SSL certificate for `brickquotepro.com` (see `positivessl.md` or use the Cloudflare Origin CA helper script).

---

## 1. Initial Server Preparation

Open PowerShell as Administrator and run updates:

```powershell
# Install all available Windows updates
Install-Module PSWindowsUpdate -Force -Confirm:$false
Get-WUInstall -AcceptAll -AutoReboot
```

Alternatively, use Windows Update manually.

---

## 2. Install IIS with Required Modules

Run the following PowerShell command to install IIS, ASP.NET, and management tools:

```powershell
$features = @(
    "Web-Server",
    "Web-Common-Http",
    "Web-Default-Doc",
    "Web-Dir-Browsing",
    "Web-Http-Errors",
    "Web-Static-Content",
    "Web-Http-Redirect",
    "Web-Health",
    "Web-Http-Logging",
    "Web-Request-Monitor",
    "Web-Performance",
    "Web-Stat-Compression",
    "Web-Dyn-Compression",
    "Web-Security",
    "Web-Filtering",
    "Web-Basic-Auth",
    "Web-Windows-Auth",
    "Web-App-Dev",
    "Web-Net-Ext45",
    "Web-Asp-Net45",
    "Web-ISAPI-Ext",
    "Web-ISAPI-Filter",
    "Web-Mgmt-Tools",
    "Web-Mgmt-Console",
    "Web-Mgmt-Compat"
)

Install-WindowsFeature -Name $features -IncludeManagementTools
```

---

## 3. Install URL Rewrite Module 2.1

Download and install from Microsoft:

```powershell
$rewriteUrl = "https://download.microsoft.com/download/1/2/8/128E2E22-C1B9-44A4-BE2A-5859ED1D0B8F/rewrite_amd64_en-US.msi"
$rewriteMsi = "C:\temp\rewrite.msi"
New-Item -ItemType Directory -Path C:\temp -Force | Out-Null
Invoke-WebRequest -Uri $rewriteUrl -OutFile $rewriteMsi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$rewriteMsi`" /quiet /norestart" -Wait
```

---

## 4. Install Application Request Routing (ARR) 3.0

```powershell
$arrUrl = "https://download.microsoft.com/download/E/9/8/E9849D64-A740-4E54-BF45-EFEA7F546A68/ARR_3.0_amd64_enUS.msi"
$arrMsi = "C:\temp\arr.msi"
Invoke-WebRequest -Uri $arrUrl -OutFile $arrMsi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$arrMsi`" /quiet /norestart" -Wait

# Enable reverse proxy in ARR
Import-Module WebAdministration
Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Filter 'system.webServer/proxy' -Name 'enabled' -Value $true
Set-WebConfigurationProperty -PSPath 'MACHINE/WEBROOT/APPHOST' -Filter 'system.webServer/proxy' -Name 'preserveHostHeader' -Value $true
```

---

## 5. Install Node.js LTS

```powershell
$nodeUrl = "https://nodejs.org/dist/v20.18.1/node-v20.18.1-x64.msi"
$nodeMsi = "C:\temp\node.msi"
Invoke-WebRequest -Uri $nodeUrl -OutFile $nodeMsi -UseBasicParsing
Start-Process msiexec.exe -ArgumentList "/i `"$nodeMsi`" /quiet /norestart" -Wait

# Refresh PATH in the current session
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
node --version
```

---

## 6. Install nssm (Service Wrapper)

```powershell
$nssmUrl = "https://nssm.cc/release/nssm-2.24.zip"
$nssmZip = "C:\temp\nssm.zip"
Invoke-WebRequest -Uri $nssmUrl -OutFile $nssmZip -UseBasicParsing
Expand-Archive -Path $nssmZip -DestinationPath C:\temp\nssm -Force
Copy-Item -Path "C:\temp\nssm\nssm-2.24\win64\nssm.exe" -Destination "$env:WINDIR\nssm.exe" -Force
```

---

## 7. Open Firewall Ports

```powershell
New-NetFirewallRule -DisplayName "HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -ErrorAction SilentlyContinue
New-NetFirewallRule -DisplayName "SSH" -Direction Inbound -Protocol TCP -LocalPort 22 -Action Allow -ErrorAction SilentlyContinue
```

---

## 8. Create Application Directories

```powershell
$appDir = "C:\inetpub\brickquotepro"
$logDir = "C:\inetpub\logs\brickquotepro"

New-Item -ItemType Directory -Path $appDir -Force | Out-Null
New-Item -ItemType Directory -Path "$appDir\site" -Force | Out-Null
New-Item -ItemType Directory -Path $logDir -Force | Out-Null

# Placeholder web.config so the IIS site can start
Set-Content -Path "$appDir\site\web.config" -Value '<?xml version="1.0" encoding="UTF-8"?><configuration><system.webServer></system.webServer></configuration>'
```

---

## 9. Configure IIS Website and Application Pool

```powershell
Import-Module WebAdministration

$domain = "brickquotepro.com"

# Remove default site if it exists
if (Get-Website -Name "Default Web Site" -ErrorAction SilentlyContinue) {
    Stop-Website -Name "Default Web Site" -ErrorAction SilentlyContinue
}

# Remove existing brickquotepro site if it exists
if (Get-Website -Name $domain -ErrorAction SilentlyContinue) {
    Remove-Website -Name $domain -Confirm:$false
}

# Create site + application pool
New-Website -Name $domain -PhysicalPath "C:\inetpub\brickquotepro\site" -Port 80 -HostHeader $domain -ApplicationPool $domain -Force | Out-Null

# Add bindings
New-WebBinding -Name $domain -Protocol "http" -Port 80 -HostHeader "www.$domain" -ErrorAction SilentlyContinue
New-WebBinding -Name $domain -Protocol "https" -Port 443 -HostHeader $domain -SslFlags 1 -ErrorAction SilentlyContinue
New-WebBinding -Name $domain -Protocol "https" -Port 443 -HostHeader "www.$domain" -SslFlags 1 -ErrorAction SilentlyContinue

# Start site and app pool
Start-Website -Name $domain
Start-WebAppPool -Name $domain
```

---

## 10. Configure the Reverse Proxy

Copy the `web.config` from the repository into the IIS site directory:

```powershell
Copy-Item -Path "C:\inetpub\brickquotepro\web.config" `
          -Destination "C:\inetpub\brickquotepro\site\web.config" -Force
```

The `web.config` includes:

- HTTP → HTTPS redirect
- `www` → apex redirect
- Reverse proxy to `http://127.0.0.1:3000`
- Security headers (HSTS, X-Frame-Options, etc.)
- Compression

---

## 11. Configure the SSL Certificate

### Option A: PositiveSSL

Follow the steps in `deployment/positivessl.md`.

### Option B: Cloudflare Origin CA

```powershell
# Save the certificate and key from Cloudflare dashboard first
.\deployment\windows\install-cloudflare-origin-cert.ps1 `
  -CertPath C:\certs\cloudflare-origin.pem `
  -KeyPath C:\certs\cloudflare-origin.key
```

---

## 12. Install the Next.js Application

### Option A: Manual first-time deploy

```powershell
# Extract the standalone build
Expand-Archive -Path C:\temp\brickquotepro-standalone.zip `
                 -DestinationPath C:\inetpub\brickquotepro\site -Force

# Copy environment file
Copy-Item -Path C:\inetpub\brickquotepro\.env `
          -Destination C:\inetpub\brickquotepro\site\.env.local -Force

# Copy web.config
Copy-Item -Path C:\inetpub\brickquotepro\web.config `
          -Destination C:\inetpub\brickquotepro\site\web.config -Force

# Create the Windows service
.\deployment\windows\install-service.ps1
```

### Option B: Use the deploy script

```powershell
.\deployment\windows\deploy.ps1 -ArtifactPath C:\temp\brickquotepro-standalone.zip
```

---

## 13. Verify the Deployment

```powershell
Invoke-WebRequest -Uri https://brickquotepro.com/api/health -UseBasicParsing
```

Expected output:

```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": ...
}
```

---

## 14. Enable OpenSSH for GitHub Actions Deployment (Optional)

```powershell
Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0
Start-Service sshd
Set-Service -Name sshd -StartupType Automatic
```

Then configure the repository secrets in GitHub (see `deploy-template.yml`).

---

## Summary Checklist

- [ ] Windows Server 2019 installed and updated.
- [ ] IIS installed with URL Rewrite and ARR.
- [ ] ARR reverse proxy enabled.
- [ ] Node.js LTS installed.
- [ ] nssm installed at `C:\Windows\nssm.exe`.
- [ ] Firewall ports 80, 443, and 22 open.
- [ ] IIS site and application pool created.
- [ ] `web.config` copied to the site directory.
- [ ] SSL certificate installed and bound.
- [ ] Next.js standalone build deployed.
- [ ] Windows service `BrickQuotePro` running.
- [ ] `/api/health` returns HTTP 200 over HTTPS.
- [ ] Cloudflare SSL/TLS set to **Full (strict)**.
