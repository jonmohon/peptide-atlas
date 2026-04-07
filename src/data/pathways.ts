import type { RegionId } from '@/types/body';

export interface Pathway {
  from: RegionId;
  to: RegionId;
  svgPath: string;
}

export interface PeptidePathways {
  peptideId: string;
  pathways: Pathway[];
}

// Pathway data for animated dots - simplified paths between body regions
export const peptidePathways: PeptidePathways[] = [
  {
    peptideId: 'bpc-157',
    pathways: [
      { from: 'gut', to: 'joints', svgPath: 'M200,340 C180,340 160,330 150,310 C140,290 130,270 130,260' },
      { from: 'gut', to: 'muscles', svgPath: 'M200,340 C220,340 240,330 255,310 C270,290 280,270 265,250' },
      { from: 'gut', to: 'skin', svgPath: 'M200,340 C230,330 260,300 280,260 C290,240 285,220 280,200' },
    ],
  },
  {
    peptideId: 'cjc-1295',
    pathways: [
      { from: 'pituitary', to: 'muscles', svgPath: 'M200,90 C200,120 180,160 150,200 C130,240 125,270 135,300' },
      { from: 'pituitary', to: 'skin', svgPath: 'M200,90 C220,120 250,160 270,190 C280,200 280,200 280,200' },
      { from: 'pituitary', to: 'bones', svgPath: 'M200,90 C200,150 200,250 200,350 C200,400 200,450 200,500' },
    ],
  },
  {
    peptideId: 'semax',
    pathways: [
      { from: 'brain', to: 'brain', svgPath: 'M185,60 C175,50 180,40 200,40 C220,40 225,50 215,60' },
    ],
  },
  {
    peptideId: 'epithalon',
    pathways: [
      { from: 'pituitary', to: 'immune-system', svgPath: 'M200,90 C200,100 195,110 192,130' },
      { from: 'pituitary', to: 'skin', svgPath: 'M200,90 C230,120 260,160 280,200' },
    ],
  },
  {
    peptideId: 'thymosin-alpha-1',
    pathways: [
      { from: 'immune-system', to: 'gut', svgPath: 'M200,130 C200,180 200,240 200,300 C200,320 200,340 200,340' },
    ],
  },
];

export function getPathwaysForPeptide(peptideId: string): Pathway[] {
  return peptidePathways.find((p) => p.peptideId === peptideId)?.pathways ?? [];
}
