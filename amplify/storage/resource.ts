/**
 * Amplify Gen 2 storage — user-scoped S3 bucket for progress photos and bloodwork PDFs.
 * Each user writes under their own Cognito-identity prefix; no cross-user reads.
 */

import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'peptideAtlasMedia',
  access: (allow) => ({
    'progress-photos/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
    'bloodwork/{entity_id}/*': [
      allow.entity('identity').to(['read', 'write', 'delete']),
    ],
  }),
});
