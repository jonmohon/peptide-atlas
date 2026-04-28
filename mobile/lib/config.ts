/**
 * Runtime configuration for the mobile app.
 *
 * API_BASE_URL is the deployed Next.js host where AI streaming endpoints live.
 * The mobile app calls these as a remote service — Cognito ID tokens go in the
 * Authorization header (see src/lib/auth.ts on the web side for verification).
 */

export const API_BASE_URL = 'https://main.d3p5rtdaradk56.amplifyapp.com';
