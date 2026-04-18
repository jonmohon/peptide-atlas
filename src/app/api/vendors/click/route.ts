/**
 * Affiliate click redirect. 302s to the vendor's URL (affiliate if present, otherwise base).
 * Client logs the click via a separate POST to /api/vendors/click-log so we keep this
 * handler fast and avoid server-side data-client wiring.
 */

import { vendorById } from '@/data/vendors';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const vendorId = url.searchParams.get('vendor');

  if (!vendorId) return new Response('Missing vendor id', { status: 400 });

  const vendor = vendorById(vendorId);
  if (!vendor) return new Response('Vendor not found', { status: 404 });

  const target = vendor.affiliateUrl ?? vendor.baseUrl;
  return Response.redirect(target, 302);
}
