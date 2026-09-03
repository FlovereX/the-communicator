/**
 * Resolves the canonical site origin for constructing absolute URLs (e.g. auth email
 * redirects), so no flow depends on a hardcoded localhost URL in production.
 *
 * Precedence: NEXT_PUBLIC_SITE_URL (canonical production/custom domain) →
 * NEXT_PUBLIC_VERCEL_URL (Vercel preview deployments, no protocol by default) →
 * http://localhost:3000 (local development only).
 */
export function getSiteUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return withProtocol(siteUrl);

  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercelUrl) return withProtocol(vercelUrl);

  return "http://localhost:3000";
}

function withProtocol(url: string): string {
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

export function getAuthConfirmUrl(): string {
  return `${getSiteUrl()}/auth/confirm`;
}
