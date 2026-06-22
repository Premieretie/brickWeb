# PositiveSSL Installation on Windows Server 2019

This guide documents how to install a Sectigo PositiveSSL certificate on Windows Server 2019, bind it to the BrickQuotePro IIS site, and integrate it with Cloudflare **Full (strict)** mode.

---

## 1. Purchase and Generate the Certificate

1. Purchase a **PositiveSSL** certificate from a reseller (e.g., Namecheap, SSLs.com) or directly from Sectigo.
2. Generate a Certificate Signing Request (CSR) on the Windows Server using IIS Manager or PowerShell.

### Option A: Generate CSR with IIS Manager

1. Open **IIS Manager** (`inetmgr`).
2. Select the server node → **Server Certificates**.
3. Click **Create Certificate Request** in the Actions pane.
4. Fill in the details:
   - Common name: `brickquotepro.com`
   - Organization: your company name
   - City/State/Country: your location
5. Choose **Cryptographic service provider**: `RSA#Microsoft Software Key Storage Provider`
6. Bit length: **2048**
7. Save the CSR file as `C:\certs\brickquotepro.csr`.
8. Submit the CSR to your SSL provider and complete domain validation (DV).

### Option B: Generate CSR with PowerShell

```powershell
$cert = New-SelfSignedCertificate -DnsName "brickquotepro.com" -CertStoreLocation cert:\LocalMachine\My -KeyAlgorithm RSA -KeyLength 2048 -Provider "Microsoft Software Key Storage Provider" -KeyExportPolicy Exportable

$csr = @"
[NewRequest]
Subject = "CN=brickquotepro.com"
KeyLength = 2048
Exportable = TRUE
ProviderName = "Microsoft Software Key Storage Provider"
RequestType = PKCS10
KeyUsage = 0xa0
"@

$csr | Out-File C:\certs\request.inf -Encoding ASCII
certreq -new C:\certs\request.inf C:\certs\brickquotepro.csr
```

Submit `C:\certs\brickquotepro.csr` to your SSL provider.

---

## 2. Download Certificate Files

After validation, you will receive one or more files:

- `brickquotepro_com.crt` or `brickquotepro_com.cer` (your certificate)
- `ca-bundle.crt` or `AAACertificateServices.crt` + `SectigoRSADomainValidationSecureServerCA.crt` + `USERTrustRSAAAACA.crt` (intermediate certificates)

Save all files to `C:\certs\`.

---

## 3. Create a PFX with Certificate Chain

Use OpenSSL or IIS Manager to combine the certificate, intermediates, and private key into a PFX.

### Option A: OpenSSL

```powershell
# If you generated the CSR in IIS, export the private key first via IIS Manager.
# If you have separate key/crt files, combine them with OpenSSL:

cmd /c "openssl pkcs12 -export -out C:\certs\brickquotepro.pfx -inkey C:\certs\private.key -in C:\certs\brickquotepro_com.crt -certfile C:\certs\ca-bundle.crt -name brickquotepro.com"
```

Enter a strong password when prompted.

### Option B: IIS Manager (Complete Certificate Request)

1. Open **IIS Manager**.
2. Select the server node → **Server Certificates**.
3. Click **Complete Certificate Request**.
4. Select the `.crt` file you received from PositiveSSL.
5. Friendly name: `brickquotepro.com PositiveSSL`
6. Certificate store: **Personal**.
7. Click **OK**.

IIS will automatically store the certificate in `Cert:\LocalMachine\My`.

---

## 4. Import the Certificate

If you created a PFX externally, import it into the Windows certificate store:

```powershell
$password = ConvertTo-SecureString -String "YourStrongPfxPassword" -Force -AsPlainText
Import-PfxCertificate -FilePath C:\certs\brickquotepro.pfx -CertStoreLocation Cert:\LocalMachine\My -Password $password
```

Verify the import:

```powershell
Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object { $_.Subject -like "*brickquotepro.com*" }
```

Copy the **Thumbprint** value for the next step.

---

## 5. Bind the Certificate to the IIS Website

### Option A: IIS Manager

1. Open **IIS Manager**.
2. Expand **Sites** → select **brickquotepro.com**.
3. Click **Bindings** in the Actions pane.
4. Click **Add**.
5. Configure:
   - Type: **https**
   - IP address: **All Unassigned** (or the server IP)
   - Port: **443**
   - Host name: **brickquotepro.com**
   - SSL certificate: select your PositiveSSL certificate
   - Require Server Name Indication: **Off** (or On if you have multiple sites on 443)
6. Click **OK**.
7. Repeat for `www.brickquotepro.com` if needed.

### Option B: PowerShell

```powershell
$domain = "brickquotepro.com"
$thumbprint = "YOUR_CERTIFICATE_THUMBPRINT"

Import-Module WebAdministration

# Remove existing HTTPS bindings for the domain
Get-WebBinding -Name $domain -Protocol "https" | Remove-WebBinding

# Add new HTTPS binding
New-WebBinding -Name $domain -Protocol "https" -Port 443 -HostHeader $domain -SslFlags 1

# Bind the certificate
$binding = Get-WebBinding -Name $domain -Protocol "https" -Port 443 -HostHeader $domain
$binding.AddSslCertificate($thumbprint, "my")

Write-Host "Certificate bound to https://$domain" -ForegroundColor Green
```

---

## 6. Verify the Intermediate Chain

Cloudflare **Full (strict)** requires the origin to present a complete certificate chain (server cert + intermediates). If the chain is incomplete, Cloudflare will reject the connection.

Test with OpenSSL from a Linux/macOS client or WSL:

```bash
openssl s_client -connect brickquotepro.com:443 -servername brickquotepro.com
```

Look for:

```
Verify return code: 0 (ok)
```

If the chain is missing, re-export the PFX with the CA bundle included, or install the intermediate certificates in the Windows **Intermediate Certification Authorities** store.

---

## 7. Cloudflare Integration

1. In Cloudflare, go to **SSL/TLS** → **Overview**.
2. Set encryption mode to **Full (strict)**.
3. Enable **Always Use HTTPS**.
4. Set **Minimum TLS Version** to **TLS 1.2**.

Because the origin now has a publicly trusted PositiveSSL certificate, Cloudflare will validate the chain end-to-end and the connection is fully secure.

---

## 8. Testing HTTPS

From the Windows Server:

```powershell
Invoke-WebRequest -Uri https://brickquotepro.com/api/health -UseBasicParsing
```

From an external machine:

```bash
curl -I https://brickquotepro.com/api/health
```

Expected response:

```
HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains; preload
```

---

## 9. Renewal

PositiveSSL certificates typically expire after 1 year. Before expiry:

1. Generate a new CSR.
2. Revalidate the domain.
3. Install the new certificate and update the IIS binding.
4. Remove the old certificate from the certificate store.

Consider using a Windows ACME client such as **win-acme** for automated Let's Encrypt certificates if you prefer not to renew manually.

---

## Summary Checklist

- [ ] PositiveSSL certificate purchased and domain validated.
- [ ] Certificate imported into `Cert:\LocalMachine\My`.
- [ ] HTTPS binding added to the IIS site.
- [ ] Certificate thumbprint bound to the binding.
- [ ] Complete certificate chain verified with `openssl s_client`.
- [ ] Cloudflare SSL/TLS set to **Full (strict)**.
- [ ] HTTPS health check returns `HTTP 200`.
