export type RegionId =
  | 'brain'
  | 'pituitary'
  | 'heart'
  | 'lungs'
  | 'liver'
  | 'gut'
  | 'kidneys'
  | 'muscles'
  | 'joints'
  | 'skin'
  | 'bones'
  | 'reproductive'
  | 'immune-system';

export interface BodyRegion {
  id: RegionId;
  label: string;
  svgGroupId: string;
  description: string;
  position: { x: number; y: number };
  relatedEffects: string[];
}

export interface RegionHighlight {
  regionId: RegionId;
  intensity: number;
  color: string;
}
