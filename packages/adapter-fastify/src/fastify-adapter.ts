import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest
} from 'fastify';
import type {
  AmbitenAdapter,
  AdapterContextOptions,
  AmbitenRequestLike
} from '@ambiten/adapter-types';
import { runWithAdapterContext } from '@ambiten/adapter-runtime';

function normalizeParams(
  params: FastifyRequest['params']
): Record<string, string> {
  if (!params || typeof params !== 'object') {
    return {};
  }

  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
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
  query: FastifyRequest['query']
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

function toAmbitenRequestLike(req: FastifyRequest): AmbitenRequestLike {
  return {
    headers: req.headers as Record<string, string | string[] | undefined>,
    url: req.url,
    method: req.method,
    params: normalizeParams(req.params),
    cookies: normalizeCookies((req as any).cookies),
    query: normalizeQuery(req.query),
    body: req.body,
    get(name: string) {
      const value = req.headers?.[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    }
  };
}

export function createFastifyAdapter(): AmbitenAdapter<FastifyInstance> {
  return {
    name: 'fastify',

    install(app: FastifyInstance, options: AdapterContextOptions = {}) {
      app.addHook(
        'preHandler',
        async (request: FastifyRequest, _reply: FastifyReply) => {
          const adaptedRequest = toAmbitenRequestLike(request);

          await runWithAdapterContext(
            adaptedRequest,
            async () => {
              // Enter Ambiten runtime context for downstream request lifecycle.
            },
            options
          );
        }
      );
    }
  };
};