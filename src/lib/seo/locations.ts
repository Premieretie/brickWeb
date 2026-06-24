export interface LocationPageData {
  slug: string;
  name: string;
  metaTitle: string;
  description: string;
  intro: string;
  popularServices: string[];
  averageCost: string;
  whyChoose: string;
  faqs: { question: string; answer: string }[];
}

export const locations: Record<string, LocationPageData> = {
  brisbane: {
    slug: 'brisbane',
    name: 'Brisbane',
    metaTitle: 'Brick Fence Cost Brisbane | Free Quotes from Local Bricklayers',
    description: 'Get brick fence, retaining wall, and bricklayer quotes in Brisbane. Compare local contractors and estimate costs instantly.',
    intro: 'Brisbane homeowners choose brick fences for privacy, security, and storm resistance. BrickQuote Pro connects you with trusted bricklayers across Brisbane.',
    popularServices: ['Brick fences', 'Block fences', 'Retaining walls', 'Brick mailboxes', 'Brick piers', 'Front fences'],
    averageCost: 'Brick fence costs in Brisbane typically range from $600 to $1,200 per linear metre, depending on height, materials, and finish.',
    whyChoose: 'BrickQuote Pro matches Brisbane homeowners with licensed, reviewed bricklayers. Every lead is scored and assigned to contractors who service your suburb.',
    faqs: [
      { question: 'Do I need council approval for a brick fence in Brisbane?', answer: 'Most brick fences over 1 metre or on the front boundary require council approval or a building certifier. Check Brisbane City Council rules.' },
      { question: 'How long does a brick fence take to build?', answer: 'A typical brick fence takes 2 to 5 days, depending on length, height, footings, and weather.' },
    ],
  },
  'gold-coast': {
    slug: 'gold-coast',
    name: 'Gold Coast',
    metaTitle: 'Brick Fence Cost Gold Coast | Local Bricklayer Quotes',
    description: 'Get brick fence and retaining wall quotes on the Gold Coast. Compare local bricklayers and estimate costs online.',
    intro: 'Gold Coast properties benefit from brick fences that withstand coastal winds and salt air while adding privacy and street appeal.',
    popularServices: ['Brick fences', 'Block fences', 'Retaining walls', 'Brick mailboxes', 'Boundary walls'],
    averageCost: 'Brick fence costs on the Gold Coast typically range from $550 to $1,100 per linear metre, depending on location and finish.',
    whyChoose: 'BrickQuote Pro connects Gold Coast homeowners with local bricklayers who understand coastal conditions and council requirements.',
    faqs: [
      { question: 'Are brick fences suitable for coastal areas?', answer: 'Yes, quality bricks and proper mortar are suitable for coastal conditions. Some finishes may require additional protection.' },
      { question: 'What areas of the Gold Coast do you service?', answer: 'Our contractors service the entire Gold Coast region, from Southport to Coolangatta and west to Nerang.' },
    ],
  },
  ipswich: {
    slug: 'ipswich',
    name: 'Ipswich',
    metaTitle: 'Brick Fence Cost Ipswich | Bricklayer & Retaining Wall Quotes',
    description: 'Get brick fence and retaining wall costs in Ipswich. Compare local bricklayers and request a fast quote.',
    intro: 'Ipswich homeowners trust brick fences for strength, security, and classic style. BrickQuote Pro helps you find local bricklayers quickly.',
    popularServices: ['Brick fences', 'Retaining walls', 'Block fences', 'Front fences'],
    averageCost: 'Brick fence costs in Ipswich typically range from $550 to $1,050 per linear metre, depending on materials and site access.',
    whyChoose: 'BrickQuote Pro matches Ipswich projects with reviewed bricklayers who understand Ipswich City Council requirements.',
    faqs: [
      { question: 'Do Ipswich brick fences need council approval?', answer: 'Yes, fences over certain heights and near front boundaries generally require approval. Always check with Ipswich City Council.' },
    ],
  },
  logan: {
    slug: 'logan',
    name: 'Logan',
    metaTitle: 'Brick Fence Cost Logan | Bricklayer Quotes & Estimates',
    description: 'Get brick fence and retaining wall costs in Logan. Compare local bricklayers and request quotes online.',
    intro: 'Logan properties range from suburban homes to acreage blocks. Brick and block fences are a popular choice for boundaries and retaining.',
    popularServices: ['Brick fences', 'Block fences', 'Retaining walls', 'Brick mailboxes'],
    averageCost: 'Brick fence costs in Logan typically range from $550 to $1,100 per linear metre, depending on site conditions and materials.',
    whyChoose: 'BrickQuote Pro connects Logan homeowners with local bricklayers who service Logan City suburbs and understand local council rules.',
    faqs: [
      { question: 'What areas of Logan do you service?', answer: 'We service Logan, Beenleigh, Springwood, Browns Plains, and surrounding suburbs.' },
    ],
  },
  'moreton-bay': {
    slug: 'moreton-bay',
    name: 'Moreton Bay',
    metaTitle: 'Brick Fence Cost Moreton Bay | Local Bricklayer Quotes',
    description: 'Get brick fence and retaining wall costs in Moreton Bay. Compare local bricklayers and request quotes.',
    intro: 'Moreton Bay homeowners choose brick fences for durability and privacy. From Redcliffe to Caboolture, our contractors cover the region.',
    popularServices: ['Brick fences', 'Block fences', 'Retaining walls', 'Front fences'],
    averageCost: 'Brick fence costs in Moreton Bay typically range from $550 to $1,150 per linear metre, depending on location and materials.',
    whyChoose: 'BrickQuote Pro connects Moreton Bay homeowners with licensed bricklayers across the region, from the coast to inland suburbs.',
    faqs: [
      { question: 'Do you service Redcliffe and Caboolture?', answer: 'Yes, our contractors cover the entire Moreton Bay region including Redcliffe, Caboolture, North Lakes, and surrounding areas.' },
    ],
  },
  redlands: {
    slug: 'redlands',
    name: 'Redlands',
    metaTitle: 'Brick Fence Cost Redlands | Bricklayer & Retaining Wall Quotes',
    description: 'Get brick fence and retaining wall costs in Redlands. Compare local bricklayers and request quotes online.',
    intro: 'Redlands properties benefit from brick fences that add privacy and withstand coastal weather. BrickQuote Pro helps you find local contractors.',
    popularServices: ['Brick fences', 'Retaining walls', 'Brick mailboxes', 'Boundary walls'],
    averageCost: 'Brick fence costs in Redlands typically range from $550 to $1,150 per linear metre, depending on materials and finish.',
    whyChoose: 'BrickQuote Pro connects Redlands homeowners with local bricklayers who service Cleveland, Capalaba, Redland Bay, and surrounding suburbs.',
    faqs: [
      { question: 'What suburbs in Redlands do you service?', answer: 'Our contractors service Cleveland, Capalaba, Redland Bay, Victoria Point, and surrounding areas.' },
    ],
  },
  'sunshine-coast': {
    slug: 'sunshine-coast',
    name: 'Sunshine Coast',
    metaTitle: 'Brick Fence Cost Sunshine Coast | Local Bricklayer Quotes',
    description: 'Get brick fence and retaining wall costs on the Sunshine Coast. Compare local bricklayers and request quotes.',
    intro: 'Sunshine Coast homes often use brick fences and retaining walls for privacy, style, and storm resistance.',
    popularServices: ['Brick fences', 'Retaining walls', 'Block fences', 'Front fences'],
    averageCost: 'Brick fence costs on the Sunshine Coast typically range from $550 to $1,150 per linear metre, depending on materials and site access.',
    whyChoose: 'BrickQuote Pro connects Sunshine Coast homeowners with local bricklayers from Caloundra to Noosa and surrounding hinterland suburbs.',
    faqs: [
      { question: 'Do you service the Sunshine Coast hinterland?', answer: 'Yes, our contractors cover coastal and hinterland areas from Caloundra to Noosa and west to Maleny.' },
    ],
  },
};
