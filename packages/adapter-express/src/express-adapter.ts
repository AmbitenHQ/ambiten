import type {
  Express,
  Request,
  RequestHandler
} from 'express';
import type {
  TenraAdapter,
  AdapterContextOptions,
  TenraRequestLike
} from '@tenra/adapter-types';
import { runWithAdapterContext } from '@tenra/adapter-runtime';

function normalizeParams(
  params: unknown
): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value[0] ?? '';
    } else if (value != null) {
      normalized[key] = String(value);
    }
  }

  return normalized;
}

function normalizeCookies(
  cookies: unknown
): Record<string, string> | undefined {
  if (!cookies || typeof cookies !== 'object') {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(cookies as Record<string, unknown>).map(([key, value]) => [
      key,
      value == null ? '' : String(value)
    ])
  );
}
function normalizeQuery(
  query: unknown
): Record<string, string | string[] | undefined> | undefined {
  if (!query || typeof query !== 'object') {
    return undefined;
  }

  const normalized: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (typeof value === 'string' || value === undefined) {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.map((item) => String(item));
    } else if (value != null) {
      normalized[key] = String(value);
    }
  }

  return normalized;
}

function toTenraRequestLike(req: Request): TenraRequestLike {
  return {
    headers: req.headers as Record<string, string | string[] | undefined>,
    url: req.url,
    method: req.method,
    params: normalizeParams(req.params),
    cookies: normalizeCookies(req.cookies),
    query: normalizeQuery(req.query),
    body: req.body,
    get(name: string) {
      return req.get(name) ?? undefined;
    }
  };
}

export function createExpressAdapter(): TenraAdapter<Express> {
  return {
    name: 'express',

    install(app: Express, options: AdapterContextOptions = {}) {
      const middleware: RequestHandler = (req, _res, next) => {
        const adaptedRequest = toTenraRequestLike(req);

        void runWithAdapterContext(
          adaptedRequest,
          async () => {
            next?.();
          },
          options
        ).catch((error: unknown) => {
          next?.(error);
        });
      };

      app.use(middleware);
    }
  };
}