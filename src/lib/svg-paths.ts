import type { RegionId } from '@/types/body';

// Professional human body silhouette - clean anatomical proportions
// ViewBox: 0 0 400 900
export const bodyOutlinePath =
  // Head
  'M200 28 C216 28 230 42 230 58 C230 74 224 86 218 92 ' +
  // Neck
  'L214 92 L214 108 ' +
  // Right shoulder
  'C228 112 248 118 262 128 C272 135 278 142 280 148 ' +
  // Right arm
  'L288 148 C296 150 306 158 312 168 L318 188 C322 200 324 214 322 228 ' +
  'L318 248 C316 258 312 266 306 272 L296 280 ' +
  // Right hand
  'C292 284 290 290 290 296 L290 310 C290 316 286 320 280 320 ' +
  'L272 318 C268 316 264 318 262 322 ' +
  // Right torso
  'L258 340 C254 354 252 368 252 382 L252 400 ' +
  // Right hip
  'C252 412 248 420 244 426 L240 432 ' +
  // Right thigh
  'L242 460 C244 480 246 500 248 520 L250 548 ' +
  // Right knee
  'C252 558 252 568 250 578 ' +
  // Right shin
  'L248 600 C246 620 244 640 244 660 L244 690 ' +
  // Right ankle/foot
  'C244 710 240 724 236 734 L232 744 C228 752 222 758 216 760 ' +
  'L208 760 C204 760 202 756 202 752 L202 748 ' +
  // Cross to left foot
  'C200 748 198 748 198 748 ' +
  'L198 752 C198 756 196 760 192 760 ' +
  'L184 760 C178 758 172 752 168 744 L164 734 C160 724 156 710 156 690 ' +
  // Left shin
  'L156 660 C156 640 154 620 152 600 ' +
  // Left knee
  'L150 578 C148 568 148 558 150 548 ' +
  // Left thigh
  'L152 520 C154 500 156 480 158 460 L160 432 ' +
  // Left hip
  'C156 420 148 412 148 400 ' +
  'L148 382 C148 368 146 354 142 340 ' +
  // Left hand
  'L138 322 C136 318 132 316 128 318 L120 320 ' +
  'C114 320 110 316 110 310 L110 296 C110 290 108 284 104 280 ' +
  // Left arm
  'L94 272 C88 266 84 258 82 248 L78 228 ' +
  'C76 214 78 200 82 188 L88 168 C94 158 104 150 112 148 ' +
  'L120 148 ' +
  // Left shoulder
  'C122 142 128 135 138 128 C152 118 172 112 186 108 ' +
  // Neck left
  'L186 92 L182 92 ' +
  // Head left
  'C176 86 170 74 170 58 C170 42 184 28 200 28 Z';

// Interactive region overlay paths - these sit on top of the silhouette
// Each region is a semi-transparent clickable area
export const regionPaths: Record<RegionId, { d: string; label: string }> = {
  brain: {
    // Head/skull area
    d: 'M176 32 C176 32 182 26 200 26 C218 26 224 32 228 38 C232 48 232 58 230 66 C228 76 224 84 220 90 L180 90 C176 84 172 76 170 66 C168 58 168 48 172 38 Z',
    label: 'Brain & CNS',
  },
  pituitary: {
    // Small gland at base of brain
    d: 'M193 86 C193 82 196 79 200 79 C204 79 207 82 207 86 C207 90 207 94 200 94 C193 94 193 90 193 86 Z',
    label: 'Pituitary Gland',
  },
  heart: {
    // Heart shape in left-center chest
    d: 'M185 200 C182 194 180 188 183 182 C186 176 192 175 196 178 L200 182 L204 178 C208 175 214 176 217 182 C220 188 218 194 215 200 L200 220 Z',
    label: 'Heart',
  },
  lungs: {
    // Two lung shapes flanking the heart
    d: 'M158 178 C154 184 150 196 152 216 C154 232 160 242 168 246 L180 240 L180 196 C176 188 166 180 162 176 Z ' +
      'M242 178 C246 184 250 196 248 216 C246 232 240 242 232 246 L220 240 L220 196 C224 188 234 180 238 176 Z',
    label: 'Lungs',
  },
  liver: {
    // Liver shape below right lung
    d: 'M195 250 C195 248 200 246 210 246 L235 246 C242 248 244 254 244 260 C244 270 240 278 232 282 L200 282 C194 280 192 272 192 264 C192 258 193 252 195 250 Z',
    label: 'Liver',
  },
  gut: {
    // Intestinal area - central abdomen
    d: 'M170 286 C166 286 163 292 163 300 C163 318 166 336 172 352 C176 362 182 372 188 378 L212 378 C218 372 224 362 228 352 C234 336 237 318 237 300 C237 292 234 286 230 286 Z',
    label: 'Gut & GI Tract',
  },
  kidneys: {
    // Two kidney bean shapes on flanks
    d: 'M152 272 C148 274 145 280 145 288 C145 298 150 304 156 304 C160 304 162 300 162 294 C162 284 158 276 155 272 Z ' +
      'M248 272 C252 274 255 280 255 288 C255 298 250 304 244 304 C240 304 238 300 238 294 C238 284 242 276 245 272 Z',
    label: 'Kidneys',
  },
  muscles: {
    // Upper arms and chest muscles
    d: 'M122 148 C114 152 104 164 96 180 L88 200 C84 212 82 226 84 240 L90 260 L108 268 L120 240 L126 200 C128 184 130 168 130 156 Z ' +
      'M278 148 C286 152 296 164 304 180 L312 200 C316 212 318 226 316 240 L310 260 L292 268 L280 240 L274 200 C272 184 270 168 270 156 Z',
    label: 'Muscles',
  },
  joints: {
    // Shoulder dots + knee dots + elbow dots
    d: 'M126 148 C120 148 116 152 116 158 C116 164 120 168 126 168 C132 168 136 164 136 158 C136 152 132 148 126 148 Z ' +
      'M274 148 C268 148 264 152 264 158 C264 164 268 168 274 168 C280 168 284 164 284 158 C284 152 280 148 274 148 Z ' +
      // Knees
      'M188 558 C183 558 179 562 179 568 C179 574 183 578 188 578 C193 578 197 574 197 568 C197 562 193 558 188 558 Z ' +
      'M212 558 C207 558 203 562 203 568 C203 574 207 578 212 578 C217 578 221 574 221 568 C221 562 217 558 212 558 Z',
    label: 'Joints & Tendons',
  },
  skin: {
    // Thin outline following body contour (face, arms, legs visible skin)
    d: 'M200 28 C216 28 228 40 229 56 C230 68 226 78 222 86 ' +
      'L220 88 C224 80 228 70 228 58 C228 44 216 32 200 32 ' +
      'C184 32 172 44 172 58 C172 70 176 80 180 88 L178 86 ' +
      'C174 78 170 68 170 56 C172 40 184 28 200 28 Z',
    label: 'Skin & Hair',
  },
  bones: {
    // Spine line + femur representations
    d: 'M197 100 L197 420 C197 420 195 420 195 424 L195 540 C194 550 192 558 192 570 L192 620 C192 640 190 660 188 680 ' +
      'L186 700 C185 710 184 718 184 724 L184 730 ' +
      // Right leg bone
      'M203 100 L203 420 C203 420 205 420 205 424 L205 540 C206 550 208 558 208 570 L208 620 C208 640 210 660 212 680 ' +
      'L214 700 C215 710 216 718 216 724 L216 730',
    label: 'Skeletal System',
  },
  reproductive: {
    // Lower pelvis area
    d: 'M180 382 C176 388 174 396 174 406 C174 416 180 424 188 426 L212 426 C220 424 226 416 226 406 C226 396 224 388 220 382 Z',
    label: 'Reproductive System',
  },
  'immune-system': {
    // Thymus area (upper chest) + lymph node dots
    d: 'M192 120 C188 120 184 124 184 130 C184 138 188 142 194 142 L206 142 C212 142 216 138 216 130 C216 124 212 120 208 120 Z ' +
      // Lymph nodes - neck
      'M176 100 C174 100 172 102 172 105 C172 108 174 110 176 110 C178 110 180 108 180 105 C180 102 178 100 176 100 Z ' +
      'M224 100 C222 100 220 102 220 105 C220 108 222 110 224 110 C226 110 228 108 228 105 C228 102 226 100 224 100 Z ' +
      // Lymph nodes - armpits
      'M152 158 C149 158 147 160 147 163 C147 166 149 168 152 168 C155 168 157 166 157 163 C157 160 155 158 152 158 Z ' +
      'M248 158 C245 158 243 160 243 163 C243 166 245 168 248 168 C251 168 253 166 253 163 C253 160 251 158 248 158 Z',
    label: 'Immune System',
  },
};

export function getRegionPath(regionId: RegionId): string {
  return regionPaths[regionId]?.d ?? '';
}
