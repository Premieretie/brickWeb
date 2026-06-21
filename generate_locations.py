import os

locations = {
    'brisbane': {'name': 'Brisbane', 'desc': 'Brisbane is the heart of South East Queensland. From Queenslander homes in the inner suburbs to modern estates in the outer areas, brick fences are a popular choice for privacy, security, and street appeal. Our calculator uses Brisbane-specific masonry rates.', 'suburbs': 'Paddington, Ashgrove, The Gap, Indooroopilly, Carindale, Chermside, Holland Park, Coorparoo, Wynnum, Manly, Stafford, Everton Park, Nundah, Sandgate, and surrounding suburbs.'},
    'ipswich': {'name': 'Ipswich', 'desc': 'Ipswich blends heritage homes with new developments across the western corridor. Brick and block fences are widely used for front fences, boundary walls, and retaining walls on sloping blocks common in the region.', 'suburbs': 'Ipswich CBD, Springfield, Springfield Lakes, Redbank Plains, Goodna, Booval, Silkstone, Brassall, North Ipswich, Churchill, and surrounding areas.'},
    'logan': {'name': 'Logan', 'desc': 'Logan is one of Queensland fastest-growing regions. With a mix of established suburbs and new estates, brick fences, block fences, and retaining walls are in high demand for boundary definition and privacy.', 'suburbs': 'Loganlea, Logan Reserve, Marsden, Crestmead, Shailer Park, Daisy Hill, Springwood, Rochedale South, Underwood, Browns Plains, and nearby suburbs.'},
    'redlands': {'name': 'Redlands', 'desc': 'Redlands includes coastal suburbs and bayside communities where brick fences provide durability against salt air and strong winds. Brick and block front fences are common in Cleveland, Victoria Point, and surrounding areas.', 'suburbs': 'Cleveland, Victoria Point, Redland Bay, Capalaba, Thornlands, Mount Cotton, Wellington Point, Thorneside, Birkdale, and bayside suburbs.'},
    'moreton-bay': {'name': 'Moreton Bay', 'desc': 'Moreton Bay covers northern Brisbane suburbs and coastal communities from Caboolture to Redcliffe. Brick fences and retaining walls are popular for privacy, noise reduction, and soil retention on sloping blocks.', 'suburbs': 'Caboolture, Morayfield, Burpengary, Narangba, North Lakes, Redcliffe, Scarborough, Kippa-Ring, Deception Bay, and surrounding areas.'},
    'gold-coast': {'name': 'Gold Coast', 'desc': 'The Gold Coast is known for modern homes, canals, and beachside properties. Brick and block fences provide security, privacy, and a premium finish for waterfront and canal-front homes.', 'suburbs': 'Southport, Surfers Paradise, Broadbeach, Mermaid Beach, Robina, Burleigh Heads, Nerang, Helensvale, Coomera, Pimpama, and coastal suburbs.'},
    'sunshine-coast': {'name': 'Sunshine Coast', 'desc': 'The Sunshine Coast combines coastal living with hinterland acreage. Brick fences, block fences, and retaining walls are used for boundary definition, privacy, and managing slopes from the coast to the hinterland.', 'suburbs': 'Maroochydore, Mooloolaba, Caloundra, Buderim, Nambour, Kawana, Sippy Downs, Noosa, Coolum, Maleny, and surrounding areas.'}
}

template = '''<!DOCTYPE html>
<html lang="en-AU">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Brick Fence Builders {name} | Cost &amp; Quote Calculator</title>
    <meta name="description" content="Brick fence builders {name}. Get instant brick fence, block fence, retaining wall and brick mailbox quotes for {name} and surrounding suburbs.">
    <meta name="keywords" content="brick fence builders {name}, brick fence {name}, block fence {name}, retaining wall {name}, brick mailbox {name}, brick fence cost {name}">
    <link rel="canonical" href="https://brickquotepro.com.au/locations/{slug}.html">
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/css/password-gate.css">
    <script src="../assets/js/password-gate.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"Service","name":"Brick Fence Builders {name}","description":"Brick fence cost estimates for {name} and surrounding suburbs.","provider":{"@type":"LocalBusiness","name":"BrickQuote Pro","url":"https://brickquotepro.com.au/"},"areaServed":{"@type":"City","name":"{name}","containedInPlace":{"@type":"State","name":"Queensland"}}}
    </script>
</head>
<body>
    <header class="main-header">
        <div class="container">
            <div class="header-content">
                <a href="../index.html" class="logo">
                    <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                        <rect x="4" y="4" width="14" height="14" fill="#C75B39"/>
                        <rect x="22" y="4" width="14" height="14" fill="#A0442A"/>
                        <rect x="4" y="22" width="14" height="14" fill="#A0442A"/>
                        <rect x="22" y="22" width="14" height="14" fill="#C75B39"/>
                    </svg>
                    <span>BrickQuote<span class="pro">Pro</span></span>
                </a>
                <nav class="main-nav">
                    <a href="/services/">Services</a>
                    <a href="/locations/">Locations</a>
                    <a href="/blog/">Blog</a>
                    <a href="/brick-fence-calculator/" class="btn-primary">Get Quote</a>
                </nav>
            </div>
        </div>
    </header>

    <section class="hero hero-small">
        <div class="container">
            <div class="hero-content">
                <h1>Brick Fence Builders {name}</h1>
                <p class="hero-subtitle">Instant brick fence, block fence, retaining wall and mailbox quotes for {name} and surrounding suburbs.</p>
                <a href="/brick-fence-calculator/" class="btn-large btn-primary">Calculate Your Fence Cost</a>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="container">
            <div class="content-wrapper">
                <h2>Brick Fences and Walls in {name}</h2>
                <p>{desc}</p>
                <p>Homeowners in {name} choose brick fences for their durability, low maintenance, and ability to withstand South East Queensland climate conditions. Whether you need a front fence, boundary wall, retaining wall, or a brick mailbox, getting an accurate quote is the first step.</p>
                
                <h2>Popular Areas We Service in {name}</h2>
                <p>We provide estimates for properties across {suburbs}</p>
                
                <h2>Brick Fence Costs in {name}</h2>
                <p>Brick fence costs in {name} follow the same 2026 South East Queensland masonry rates used across our calculator. As a guide, single face brick fences range from $280 to $420 per square metre, and double face brick fences range from $380 to $520 per square metre. Block fences are typically $180 to $320 per square metre, and retaining walls are priced according to height and engineering requirements.</p>
                <p>Use our <a href="/brick-fence-calculator/">brick fence calculator</a> to enter your exact dimensions, material, and options for an instant estimate tailored to {name}.</p>
                
                <h2>Services Available in {name}</h2>
                <ul>
                    <li><a href="/services/brick-fences.html">Brick fences</a></li>
                    <li><a href="/services/block-fences.html">Block fences</a></li>
                    <li><a href="/services/brick-walls.html">Brick walls</a></li>
                    <li><a href="/services/retaining-walls.html">Retaining walls</a></li>
                    <li><a href="/services/front-fences.html">Front fences</a></li>
                    <li><a href="/services/boundary-walls.html">Boundary walls</a></li>
                    <li><a href="/services/brick-mailboxes.html">Brick mailboxes and letterboxes</a></li>
                    <li><a href="/services/brick-piers.html">Brick piers and columns</a></li>
                </ul>
                
                <h2>Local Regulations</h2>
                <p>Before building a brick fence or wall in {name}, check with your local council regarding height limits, setback requirements, and retaining wall approvals. Front fences are generally limited to 1.8 metres, and boundary walls to 2.0 metres. Retaining walls over 1.0 metre typically require engineering certification.</p>
                
                <h2>Get a Quote for {name}</h2>
                <p>Our calculator is designed to give you a realistic estimate for your {name} project in seconds. You can also save your quote, share it, or download it as a PDF.</p>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <div class="cta-content">
                <h2>Get Your {name} Quote Now</h2>
                <p>Calculate your brick fence or wall cost instantly.</p>
                <a href="/brick-fence-calculator/" class="btn-large btn-white">Start Your Quote</a>
            </div>
        </div>
    </section>

    <footer class="main-footer">
        <div class="container">
            <div class="footer-grid">
                <div class="footer-brand">
                    <div class="logo">
                        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
                            <rect x="4" y="4" width="14" height="14" fill="#C75B39"/>
                            <rect x="22" y="4" width="14" height="14" fill="#A0442A"/>
                            <rect x="4" y="22" width="14" height="14" fill="#A0442A"/>
                            <rect x="22" y="22" width="14" height="14" fill="#C75B39"/>
                        </svg>
                        <span>BrickQuote<span class="pro">Pro</span></span>
                    </div>
                    <p>Professional brick fence and wall quoting for Brisbane, Ipswich, Logan, Redlands, Moreton Bay, Gold Coast and Sunshine Coast.</p>
                </div>
                <div class="footer-links">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="/services/brick-fences.html">Brick Fences</a></li>
                        <li><a href="/services/block-fences.html">Block Fences</a></li>
                        <li><a href="/services/brick-walls.html">Brick Walls</a></li>
                        <li><a href="/services/retaining-walls.html">Retaining Walls</a></li>
                        <li><a href="/services/brick-mailboxes.html">Brick Mailboxes</a></li>
                        <li><a href="/services/brick-piers.html">Brick Piers</a></li>
                    </ul>
                </div>
                <div class="footer-links">
                    <h4>Locations</h4>
                    <ul>
                        <li><a href="brisbane.html">Brisbane</a></li>
                        <li><a href="ipswich.html">Ipswich</a></li>
                        <li><a href="logan.html">Logan</a></li>
                        <li><a href="redlands.html">Redlands</a></li>
                        <li><a href="moreton-bay.html">Moreton Bay</a></li>
                        <li><a href="gold-coast.html">Gold Coast</a></li>
                        <li><a href="sunshine-coast.html">Sunshine Coast</a></li>
                    </ul>
                </div>
                <div class="footer-contact">
                    <h4>Contact</h4>
                    <p>Get in touch for detailed quotes and site assessments.</p>
                    <a href="/brick-fence-calculator/" class="btn-small">Request Callback</a>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 BrickQuote Pro. All rights reserved.</p>
                <p class="disclaimer">Instant quotes are estimates only. Final pricing subject to site inspection.</p>
            </div>
        </div>
    </footer>
</body>
</html>
'''

base_dir = r'C:\Users\User\Documents\StreamPulse\AI_Video\brickWeb\locations'
os.makedirs(base_dir, exist_ok=True)
for slug, data in locations.items():
    path = os.path.join(base_dir, f'{slug}.html')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(template.format(slug=slug, **data))
    print(f'Created {path}')
