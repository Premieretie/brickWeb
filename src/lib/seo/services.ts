export interface ServicePageData {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  intro: string;
  whatIs: string;
  benefits: string[];
  averageCost: string;
  faqs: { question: string; answer: string }[];
}

export const services: Record<string, ServicePageData> = {
  'brick-fences': {
    slug: 'brick-fences',
    title: 'Brick Fence Cost Brisbane',
    metaTitle: 'Brick Fence Cost Brisbane | Brick & Front Fence Quotes',
    description: 'Get an instant brick fence cost estimate for Brisbane. Compare solid brick, rendered, and brick-front fence options.',
    intro: 'Brick fences are the most popular boundary choice in Brisbane. They are durable, secure, and add significant value to a property.',
    whatIs: 'A brick fence is a freestanding or boundary wall built from clay or concrete bricks. Brick fences are commonly used for front fences, side boundaries, and privacy walls.',
    benefits: [
      'Strong and durable in Brisbane storms',
      'Low long-term maintenance',
      'Excellent noise and privacy barrier',
      'Adds curb appeal and resale value',
    ],
    averageCost: 'Brick fence costs in Brisbane typically range from $600 to $1,200 per linear metre, depending on height, materials, footings, and finish.',
    faqs: [
      { question: 'Do I need a permit for a brick fence in Brisbane?', answer: 'Most brick fences over 1 metre or located near the front boundary require council approval or a building certifier. Always check with Brisbane City Council.' },
      { question: 'How long does a brick fence last?', answer: 'With quality bricks and proper footings, a brick fence can last 50 years or more.' },
      { question: 'Can I render a brick fence?', answer: 'Yes. Brick fences can be rendered for a modern look, which usually adds $100–$250 per linear metre.' },
    ],
  },
  'block-fences': {
    slug: 'block-fences',
    title: 'Block Fence Cost Brisbane',
    metaTitle: 'Block Fence Cost Brisbane | Concrete Block Wall Quotes',
    description: 'Estimate concrete block fence costs in Brisbane. Compare block wall pricing for boundary, retaining, and sound barrier fences.',
    intro: 'Concrete block fences are a strong, cost-effective alternative to brick. They are popular for sound barriers, retaining walls, and large boundary fences.',
    whatIs: 'A block fence is built from hollow or solid concrete blocks. It can be reinforced with steel and concrete, then rendered or painted for a clean finish.',
    benefits: [
      'Excellent structural strength',
      'Great for retaining and soundproofing',
      'Can be rendered for a modern look',
      'Often faster to build than brick',
    ],
    averageCost: 'Concrete block fences in Brisbane typically cost $500 to $1,000 per linear metre, depending on block type, reinforcement, and finish.',
    faqs: [
      { question: 'Are block fences cheaper than brick?', answer: 'Block fences are often cheaper per linear metre, especially for larger walls. Rendering can narrow the gap.' },
      { question: 'Can a block fence be used as a retaining wall?', answer: 'Yes, reinforced block walls are commonly used for retaining and can be engineered for higher loads.' },
    ],
  },
  'retaining-walls': {
    slug: 'retaining-walls',
    title: 'Brick Retaining Wall Cost Brisbane',
    metaTitle: 'Brick Retaining Wall Cost Brisbane | Engineered Wall Quotes',
    description: 'Estimate brick and block retaining wall costs in Brisbane. Compare engineered retaining wall pricing and get a quote.',
    intro: 'Retaining walls hold back soil and create level areas. Brick and block retaining walls are a premium choice that can be engineered to last.',
    whatIs: 'A retaining wall is a structural wall designed to retain soil and manage changes in ground level. Brick and block walls are often used for aesthetic and high-value projects.',
    benefits: [
      'Adds usable space to sloping blocks',
      'Long-lasting structural solution',
      'Attractive finish when rendered or painted',
      'Can include drainage and footings',
    ],
    averageCost: 'Retaining wall costs in Brisbane range from $400 to $1,000 per square metre, depending on height, materials, drainage, and engineering requirements.',
    faqs: [
      { question: 'Do retaining walls need engineering?', answer: 'Walls over 1 metre in height or supporting significant loads generally require a structural engineer and council approval.' },
      { question: 'What is the cheapest retaining wall material?', answer: 'Treated timber or concrete sleepers are usually the cheapest, while brick and block offer the longest lifespan.' },
    ],
  },
  'brick-mailboxes': {
    slug: 'brick-mailboxes',
    title: 'Brick Mailbox Cost Brisbane',
    metaTitle: 'Brick Mailbox Cost Brisbane | Letterbox Installation Quotes',
    description: 'Get a brick mailbox cost estimate for Brisbane. Compare brick letterbox styles, finishes, and installation prices.',
    intro: 'A brick mailbox is a classic finishing touch for a brick fence. It matches the fence, adds strength, and improves street appeal.',
    whatIs: 'A brick mailbox is a letterbox built from brickwork to match a fence or home. It can be rendered, painted, or left natural.',
    benefits: [
      'Matches your brick fence or home',
      'Secure and vandal-resistant',
      'Improves curb appeal',
      'Long-lasting construction',
    ],
    averageCost: 'Brick mailboxes in Brisbane typically cost $600 to $1,500 installed, depending on size, materials, and finish.',
    faqs: [
      { question: 'Can a mailbox be built into a brick fence?', answer: 'Yes, a brick mailbox can be built as a pier or integrated into the front fence.' },
      { question: 'Do brick mailboxes need a concrete footing?', answer: 'Yes, a concrete footing is required for stability and to meet council requirements.' },
    ],
  },
  'brick-piers': {
    slug: 'brick-piers',
    title: 'Brick Pier & Column Cost Brisbane',
    metaTitle: 'Brick Pier Cost Brisbane | Brick Fence Columns & Pillars',
    description: 'Estimate brick pier and column costs in Brisbane. Compare brick fence pillars, gate piers, and rendered column prices.',
    intro: 'Brick piers provide structural support for gates, fence panels, and letterboxes. They are also a decorative feature at the front of a property.',
    whatIs: 'A brick pier is a vertical brick column built to support a gate, fence, or mailbox. Piers are often built with reinforced concrete cores.',
    benefits: [
      'Strong support for gates and fences',
      'Decorative feature at entrances',
      'Can be rendered or painted',
      'Long-lasting and low maintenance',
    ],
    averageCost: 'Brick piers in Brisbane typically cost $400 to $1,000 each, depending on height, width, materials, and finish.',
    faqs: [
      { question: 'How far apart should brick piers be?', answer: 'Pier spacing depends on the gate or fence panel width, but 2.4 to 3 metres is common.' },
      { question: 'Do brick piers need reinforcement?', answer: 'Yes, brick piers generally require steel reinforcement and concrete fill for strength.' },
    ],
  },
  'brick-walls': {
    slug: 'brick-walls',
    title: 'Brick Wall Cost Brisbane',
    metaTitle: 'Brick Wall Cost Brisbane | Internal & Boundary Wall Quotes',
    description: 'Estimate brick wall costs in Brisbane for boundary, feature, and structural walls. Get instant brick wall pricing.',
    intro: 'Brick walls are used for boundaries, feature walls, and structural projects. They offer strength, sound insulation, and a premium look.',
    whatIs: 'A brick wall is a masonry wall built from clay or concrete bricks. It can be used as a boundary, feature, or structural element.',
    benefits: [
      'Excellent structural strength',
      'Good acoustic and thermal insulation',
      'Wide range of colours and textures',
      'Adds value and appeal',
    ],
    averageCost: 'Brick wall costs in Brisbane typically range from $600 to $1,400 per square metre, depending on thickness, finish, and engineering.',
    faqs: [
      { question: 'Can brick walls be used indoors?', answer: 'Yes, brick walls are popular as feature walls and can be sealed or painted for interior use.' },
      { question: 'Do brick walls need insulation?', answer: 'External walls often require insulation to meet energy efficiency standards, while boundary walls are usually solid.' },
    ],
  },
  'front-fences': {
    slug: 'front-fences',
    title: 'Front Fence Cost Brisbane',
    metaTitle: 'Front Fence Cost Brisbane | Brick & Wrought Iron Front Fences',
    description: 'Estimate front fence costs in Brisbane. Compare brick, brick-front, and rendered front fence options and styles.',
    intro: 'Your front fence is the first thing people see. A brick or brick-front fence makes a strong impression and adds security and privacy.',
    whatIs: 'A front fence is the boundary fence at the front of a property. Brick front fences can be solid, brick-front with timber or steel infill, or rendered.',
    benefits: [
      'Enhances street appeal',
      'Improves security and privacy',
      'Durable in Brisbane weather',
      'Adds property value',
    ],
    averageCost: 'Front fence costs in Brisbane range from $500 to $1,500 per linear metre, depending on materials, height, and finish.',
    faqs: [
      { question: 'What is the maximum front fence height in Brisbane?', answer: 'Front fence height limits vary by zoning, but 1.2 to 1.5 metres is common. Check Brisbane City Council requirements.' },
      { question: 'Can a brick front fence have a gate?', answer: 'Yes, brick piers can support steel, timber, or aluminium gates.' },
    ],
  },
  'boundary-walls': {
    slug: 'boundary-walls',
    title: 'Boundary Wall Cost Brisbane',
    metaTitle: 'Boundary Wall Cost Brisbane | Brick & Block Boundary Fencing',
    description: 'Estimate boundary wall costs in Brisbane. Compare brick, block, and rendered boundary walls for privacy and security.',
    intro: 'Boundary walls separate neighbouring properties and provide privacy and security. Brick and block boundary walls are popular in Brisbane for their durability.',
    whatIs: 'A boundary wall is a wall built along the property line between two properties. It can be brick, block, or a combination of materials.',
    benefits: [
      'Privacy and noise reduction',
      'Long-lasting construction',
      'Fire-resistant and low maintenance',
      'Can be shared with neighbours',
    ],
    averageCost: 'Boundary wall costs in Brisbane range from $500 to $1,200 per linear metre, depending on height, materials, and footings.',
    faqs: [
      { question: 'Who pays for a boundary wall?', answer: 'Costs are usually shared between neighbours if the wall is on the boundary. Discuss and document an agreement before building.' },
      { question: 'How high can a boundary wall be?', answer: 'Boundary wall height limits vary by council and zoning. In Brisbane, 2 metres is common, but exceptions apply.' },
    ],
  },
};
