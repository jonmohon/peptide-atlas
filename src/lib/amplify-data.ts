/**
 * Typed Amplify Data client generated from the AppSync schema.
 * Import dataClient wherever DynamoDB reads/writes are needed on the client side.
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

export const dataClient = generateClient<Schema>();

export type { Schema };
