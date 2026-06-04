import type {
  AmbitenAdapter,
  AdapterContextOptions,
  AmbitenRequestLike
} from '@ambiten/adapter-types';
import { runWithAdapterContext } from '@ambiten/adapter-runtime';

type ExpressLikeApp = {
  use(handler: ExpressLikeMiddleware): unknown;
};

type ExpressLikeNext = (error?: unknown) => void;

type ExpressLikeMiddleware = (
  req: ExpressLikeRequest,
  res: unknown,
  next: ExpressLikeNext
) => unknown;

type ExpressLikeRequest = {
  headers?: Record<string, string | string[] | undefined>;
  url?: string;
  originalUrl?: string;
  method?: string;
  params?: unknown;
  cookies?: unknown;
  query?: unknown;
  body?: unknown;
  get?: (name: string) => string | undefined;
};

function normalizeParams(params: unknown): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === 'string') normalized[key] = value;
    else if (Array.isArray(value)) normalized[key] = String(value[0] ?? '');
    else if (value != null) normalized[key] = String(value);
  }

  return normalized;
}

function normalizeCookies(cookies: unknown): Record<string, string> | undefined {
  if (!cookies || typeof cookies !== 'object') return undefined;

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
  if (!query || typeof query !== 'object') return undefined;

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

function toAmbitenRequestLike(req: ExpressLikeRequest): AmbitenRequestLike {
  return {
    headers: req.headers ?? {},
    url: req.originalUrl ?? req.url ?? '',
    method: req.method ?? 'GET',
    params: normalizeParams(req.params),
    cookies: normalizeCookies(req.cookies),
    query: normalizeQuery(req.query),
    body: req.body,
    get(name: string) {
      return req.get?.(name) ?? req.headers?.[name.toLowerCase()]?.toString();
    }
  };
}

export function createExpressAdapter(): AmbitenAdapter<ExpressLikeApp> {
  return {
    name: 'express',

    install(app: ExpressLikeApp, options: AdapterContextOptions = {}) {
      const middleware: ExpressLikeMiddleware = (req, _res, next) => {
        const adaptedRequest = toAmbitenRequestLike(req);

        void runWithAdapterContext(
          adaptedRequest,
          async () => {
            next();
          },
          options
        ).catch((error: unknown) => {
          next(error);
        });
      };

      app.use(middleware);
    }
  };
}