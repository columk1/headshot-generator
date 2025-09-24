import { headers } from 'next/headers';

export async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get('x-forwarded-proto') ?? 'http';
  const host = h.get('x-forwarded-host') ?? h.get('host');

  if (host) return `${proto}://${host}`;

  const envUrl = process.env.NEXT_PUBLIC_SITE_URL
    || process.env.VERCEL_URL
    || process.env.BASE_URL;

  if (envUrl) {
    if (envUrl.startsWith('http')) return envUrl;
    return `https://${envUrl}`;
  }

  return 'http://localhost:3000';
}
