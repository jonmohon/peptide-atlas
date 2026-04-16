/**
 * Re-exports the raw Amplify Gen 2 outputs object from amplify_outputs.json
 * for use in shared config contexts that need the config before Amplify is configured.
 */

import outputs from '../../amplify_outputs.json';

export const amplifyConfig = outputs;
