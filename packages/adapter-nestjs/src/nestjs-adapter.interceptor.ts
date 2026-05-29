import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { runWithAdapterContext } from '@tenra/adapter-runtime';
import type { TenraRequestLike } from '@tenra/adapter-types';
import type { NestjsTenraAdapterOptions } from './nestjs-adapter.types';
import { TENRA_ADAPTER_OPTIONS } from './nestjs-adapter.constants';

function normalizeParams(params: unknown): Record<string, string> {
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

function toTenraRequestLike(req: any): TenraRequestLike {
  const headers =
    (req?.headers ?? {}) as Record<string, string | string[] | undefined>;

  return {
    headers,
    url: req?.url,
    method: req?.method,
    params: normalizeParams(req?.params),
    cookies: normalizeCookies(req?.cookies),
    query: normalizeQuery(req?.query),
    body: req?.body,
    get(name: string) {
      const value = headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    }
  };
}

@Injectable()
export class TenraNestInterceptor implements NestInterceptor {
  constructor(
    @Inject(TENRA_ADAPTER_OPTIONS)
    private readonly options: NestjsTenraAdapterOptions = {}
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest();

    const adaptedRequest = toTenraRequestLike(req);

    return runWithAdapterContext(
      adaptedRequest,
      async () => next.handle(),
      this.options
    );
  }
};