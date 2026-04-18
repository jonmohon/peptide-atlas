/**
 * Vendor directory — curated list of peptide suppliers.
 * Add real partnerships by editing this file. `affiliateUrl` is what users click through to;
 * `baseUrl` is the fallback if no affiliate deal. `rating` is an internal trust score (0-10).
 *
 * IMPORTANT: The listings here are editorial, not medical/legal endorsements.
 * Do not list vendors that make outright medical claims or ship to restricted regions.
 */

export type VendorTier = 'preferred' | 'trusted' | 'listed';
export type TestingStatus = 'independent' | 'in-house' | 'none' | 'unknown';

export interface Vendor {
  id: string;
  name: string;
  tagline: string;
  baseUrl: string;
  affiliateUrl: string | null;
  tier: VendorTier;
  rating: number;
  testingStatus: TestingStatus;
  shippingRegions: string[];
  specialties: string[];
  peptideSlugs: string[];
  notes?: string;
  foundedYear?: number;
}

export const vendors: Vendor[] = [
  {
    id: 'example-a',
    name: 'Example Research Co.',
    tagline: 'Third-party tested research peptides, US-based.',
    baseUrl: 'https://example.com',
    affiliateUrl: null,
    tier: 'preferred',
    rating: 9,
    testingStatus: 'independent',
    shippingRegions: ['US', 'CA'],
    specialties: ['healing', 'longevity'],
    peptideSlugs: ['bpc-157', 'tb-500', 'ghk-cu'],
    notes: 'Seed listing — replace with real partnership before shipping.',
  },
  {
    id: 'example-b',
    name: 'Example Biotech',
    tagline: 'COA on every lot; cold-chain shipping.',
    baseUrl: 'https://example.com',
    affiliateUrl: null,
    tier: 'trusted',
    rating: 8,
    testingStatus: 'independent',
    shippingRegions: ['US', 'EU'],
    specialties: ['growth-hormone', 'metabolic'],
    peptideSlugs: ['ipamorelin', 'cjc-1295', 'tesamorelin'],
  },
];

export function vendorsForPeptide(peptideSlug: string): Vendor[] {
  return vendors
    .filter((v) => v.peptideSlugs.includes(peptideSlug))
    .sort((a, b) => b.rating - a.rating);
}

export function vendorById(id: string): Vendor | undefined {
  return vendors.find((v) => v.id === id);
}
