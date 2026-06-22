export const BRICKQUOTE_CONFIG = {
  disclaimer:
    'These are estimates only. Actual costs vary based on site conditions, soil type, council requirements, and material availability. Always obtain a formal quote from a licensed contractor before committing to any work. Prices reflect Brisbane metropolitan area as of 2026.',

  materialTypes: {
    brick: {
      name: 'Clay Brick',
      length: 0.23,
      width: 0.11,
      height: 0.076,
      mortar: 0.01,
    },
    block: {
      name: 'Concrete Block',
      length: 0.39,
      width: 0.19,
      height: 0.19,
      mortar: 0.01,
    },
  },

  bricks: [
    {
      id: 'single-face-standard',
      name: 'Single Face Standard',
      category: 'singleFaceBrick',
      color: '#C75B39',
      price: 195,
      priceMin: 180,
      priceMax: 220,
    },
    {
      id: 'single-face-premium',
      name: 'Single Face Premium',
      category: 'singleFaceBrick',
      color: '#B85C38',
      price: 250,
      priceMin: 220,
      priceMax: 280,
    },
    {
      id: 'double-face-standard',
      name: 'Double Face Standard',
      category: 'doubleFaceBrick',
      color: '#A0442A',
      price: 285,
      priceMin: 260,
      priceMax: 320,
    },
    {
      id: 'double-face-premium',
      name: 'Double Face Premium',
      category: 'doubleFaceBrick',
      color: '#8B3A22',
      price: 350,
      priceMin: 320,
      priceMax: 420,
    },
  ],

  blocks: [
    {
      id: 'smooth-190-grey',
      name: 'Smooth 190mm Grey',
      category: 'concreteBlock',
      color: '#9E9E9E',
      price: 160,
      priceMin: 140,
      priceMax: 190,
    },
    {
      id: 'split-face-190',
      name: 'Split Face 190mm',
      category: 'concreteBlock',
      color: '#757575',
      price: 200,
      priceMin: 175,
      priceMax: 240,
    },
    {
      id: 'honed-190',
      name: 'Honed 190mm',
      category: 'concreteBlock',
      color: '#BDBDBD',
      price: 230,
      priceMin: 210,
      priceMax: 280,
    },
  ],

  columns: {
    none: { name: 'None', priceTypical: 0, priceMin: 0, priceMax: 0 },
    '190': { name: '190 x 190mm', priceTypical: 180, priceMin: 150, priceMax: 280 },
    '230': { name: '230 x 230mm', priceTypical: 380, priceMin: 250, priceMax: 600 },
    '350': { name: '350 x 350mm', priceTypical: 850, priceMin: 600, priceMax: 1200 },
    '450': { name: '450 x 450mm', priceTypical: 1250, priceMin: 900, priceMax: 1800 },
  },

  mailboxes: {
    none: { name: 'No Mailbox', price: 0 },
    standard: { name: 'Standard', price: 750 },
    pillar: { name: 'Pillar', price: 1500 },
    parcel: { name: 'Large Parcel', price: 2500 },
  },

  estimateLevels: {
    budget: { name: 'Budget', description: 'Basic finishes', multiplier: 0.8 },
    typical: { name: 'Typical', description: 'Standard quality', multiplier: 1.0 },
    premium: { name: 'Premium', description: 'High-end finishes', multiplier: 1.3 },
  },

  layouts: {
    straight: { name: 'Straight', sections: 1, defaultLengths: [10] },
    'l-shape': { name: 'L Shape', sections: 2, defaultLengths: [10, 6] },
    'u-shape': { name: 'U Shape', sections: 3, defaultLengths: [10, 6, 10] },
    'front-returns': { name: 'With Returns', sections: 3, defaultLengths: [10, 2, 2] },
  },

  projectTypes: {
    'brick-fence': { name: 'Brick Fence' },
    'brick-wall': { name: 'Brick Wall' },
    'front-fence': { name: 'Front Fence' },
    'retaining-wall': { name: 'Retaining Wall' },
    mailbox: { name: 'Mailbox' },
    'mailbox-fence': { name: 'Mailbox + Brick' },
  },
};

export interface QuoteState {
  materialType: 'brick' | 'block';
  projectType: string;
  layout: string;
  lengths: number[];
  height: number;
  brick: string;
  columnSize: string;
  columnCount: number;
  mailboxType: string;
  estimateLevel: 'budget' | 'typical' | 'premium';
}

export interface QuoteResult {
  wallArea: number;
  totalLength: number;
  columnCount: number;
  columnSize: string;
  mailboxType: string;
  materialName: string;
  estimateName: string;
  totalMin: number;
  totalMax: number;
  totalAvg: number;
  breakdown: { label: string; value: string; highlight?: boolean }[];
}

export function calculateQuote(options: QuoteState): QuoteResult {
  const {
    projectType,
    lengths,
    height,
    brick: brickId,
    columnSize,
    columnCount,
    mailboxType,
    estimateLevel = 'typical',
    materialType,
  } = options;

  const config = BRICKQUOTE_CONFIG;
  const materials = materialType === 'block' ? config.blocks : config.bricks;
  const material = materials.find((m) => m.id === brickId) || materials[0];
  const column = config.columns[columnSize as keyof typeof config.columns] || config.columns['230'];
  const mailbox = config.mailboxes[mailboxType as keyof typeof config.mailboxes] || config.mailboxes.none;
  const estimateMultiplier = config.estimateLevels[estimateLevel]?.multiplier ?? 1.0;

  const totalLength = lengths.reduce((sum, len) => sum + len, 0);
  const wallArea = totalLength * height;

  const wallCost = wallArea * material.price * estimateMultiplier;
  const columnCost = columnCount * column.priceTypical * estimateMultiplier;
  const mailboxCost = mailbox.price;
  const totalAvg = Math.round(wallCost + columnCost + mailboxCost);

  const minRate = materialType === 'block' ? 140 : 140;
  const maxRate = materialType === 'block' ? 280 : 420;
  const totalMin = Math.round(
    wallArea * minRate * estimateMultiplier +
      columnCount * column.priceMin * estimateMultiplier +
      mailboxCost
  );
  const totalMax = Math.round(
    wallArea * maxRate * estimateMultiplier +
      columnCount * column.priceMax * estimateMultiplier +
      mailboxCost
  );

  const projectName = config.projectTypes[projectType as keyof typeof config.projectTypes]?.name ?? projectType;
  const categoryName =
    material.category === 'singleFaceBrick'
      ? 'Single Face Brick'
      : material.category === 'doubleFaceBrick'
        ? 'Double Face Brick'
        : 'Concrete Blocks';

  const breakdown = [
    { label: 'Project Type', value: projectName },
    { label: 'Material', value: `${material.name} (${categoryName})` },
    { label: 'Wall Area', value: `${Math.round(wallArea * 10) / 10} m²` },
    { label: 'Wall Cost', value: `$${Math.round(wallCost).toLocaleString()}` },
    ...(columnCount > 0
      ? [{ label: `${columnCount} × ${column.name} Piers`, value: `$${Math.round(columnCost).toLocaleString()}` }]
      : []),
    ...(mailboxCost > 0
      ? [{ label: `Mailbox (${mailbox.name})`, value: `$${mailboxCost.toLocaleString()}` }]
      : []),
    {
      label: `Total Estimate (${config.estimateLevels[estimateLevel].name})`,
      value: `$${totalAvg.toLocaleString()}`,
      highlight: true,
    },
    { label: 'Range', value: `$${totalMin.toLocaleString()} – $${totalMax.toLocaleString()}` },
  ];

  return {
    wallArea: Math.round(wallArea * 10) / 10,
    totalLength: Math.round(totalLength * 10) / 10,
    columnCount,
    columnSize,
    mailboxType,
    materialName: material.name,
    estimateName: config.estimateLevels[estimateLevel].name,
    totalMin,
    totalMax,
    totalAvg,
    breakdown,
  };
}

export function suggestColumns(totalLength: number, columnSize: string): number {
  const spacing: Record<string, number> = { '190': 4, '230': 6, '350': 4, '450': 3 };
  const gap = spacing[columnSize] ?? 6;
  return Math.max(2, Math.round(totalLength / gap));
}
