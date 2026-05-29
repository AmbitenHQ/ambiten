import type { TenraRequestLike, TenancyOptions } from './types.js';

function readHeader(req: TenraRequestLike, name: string): string | undefined {
  const value = req.headers?.[name.toLowerCase()];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function fromSubdomain(req: TenraRequestLike): string | undefined {
  const host = readHeader(req, 'host');
  if (!host) return undefined;

  const hostname = host.split(':')[0];
  const parts = hostname.split('.');

  if (parts.length < 3) return undefined;

  return parts[0];
}

export async function resolveTenant(
  req: TenraRequestLike,
  opts: TenancyOptions = {}
): Promise<string | undefined> {
  const {
    header = 'x-tenant-id',
    cookie,
    param,
    subdomain = false,
    jwtClaim,
    fallback,
    resolver
  } = opts;

  if (resolver) {
    const resolved = await resolver(req);
    if (resolved) return resolved;
  }

  const byHeader = readHeader(req, header);
  if (byHeader) return byHeader;

  if (cookie && req.cookies?.[cookie]) {
    return req.cookies[cookie];
  }

  if (param && req.params?.[param]) {
    return req.params[param];
  }

  if (subdomain) {
    const sub = fromSubdomain(req);
    if (sub) return sub;
  }

  if (jwtClaim) {
    const rawClaims = readHeader(req, 'x-user-claims');
    if (rawClaims) {
      try {
        const claims = JSON.parse(rawClaims);
        const segments = jwtClaim.split('.');
        let current: any = claims;

        for (const seg of segments) {
          current = current?.[seg];
        }

        if (typeof current === 'string') return current;
      } catch {/* empty */ }
    }
  }

  return fallback;
};