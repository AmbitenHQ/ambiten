import 'dotenv/config';
import { createClient, RedisClientType } from 'redis';


type AmbitenRedisClient = {
  isOpen: boolean;
  connect(): Promise<any>;
  disconnect(): Promise<any>;
  quit?: () => Promise<any>;
  publish(channel: string, message: string): Promise<any>;
  subscribe(channel: string, listener: any): Promise<any>;
  duplicate(): AmbitenRedisClient;
  get(key: string): Promise<string | null>;
  set(key: string, value: any, options?: any): Promise<any>;
  del(...keys: string[]): Promise<number>;
  exists(key: string): Promise<number>;
  scan(cursor?: number | string, options?: any): Promise<any>;
  multi(): any;
};

const DEFAULT_RECONNECT = (retries: number) =>
  Math.min(retries * 50, 1000);

const redisUrl = process.env.REDIS_URI as string | undefined;

let currentClient: AmbitenRedisClient | null = null;

type RedisLike = AmbitenRedisClient & {
  isOpen: boolean;
  scan?: (...args: any[]) => Promise<any>;
};

const createStub = (): RedisLike => ({
  isOpen: false,

  connect: async () => null,
  disconnect: async () => null,

  publish: async () => 0,
  subscribe: async () => null,
  duplicate: () => createStub(),

  get: async () => null,
  set: async () => 'OK',
  del: async () => 0,
  exists: async () => 0,

  scan: async () => ({
    cursor: 0,
    keys: [],
  }),

  multi: () => ({
    incr() {
      return this;
    },
    expire() {
      return this;
    },
    exec: async () => [],
  }),
});

export const redis: any = {
  async getClient(uri?: string): Promise<RedisLike> {
    if (currentClient && currentClient.isOpen) {
      return currentClient;
    }

    const url = uri || redisUrl;

    if (!url) {
      return createStub();
    }

    try {
      const client = createClient({
        url,
        socket: {
          reconnectStrategy: DEFAULT_RECONNECT,
        },
      }) as AmbitenRedisClient;

      await client.connect();

      currentClient = client;

      return client;
    } catch {
      return createStub();
    }
  },

  async disconnect() {
    if (currentClient) {
      try {
        if (
          currentClient.isOpen &&
          typeof currentClient.disconnect === 'function'
        ) {
          await currentClient.disconnect();
        } else if (
          currentClient.isOpen &&
          typeof (currentClient as any).quit === 'function'
        ) {
          await (currentClient as any).quit();
        }
      } catch {
        // swallow disconnect errors
      }
    }

    currentClient = null;
  },

  get isOpen() {
    return !!currentClient?.isOpen;
  },

  async get(key: string) {
    const client = await this.getClient();
    return client.get?.(key);
  },

  async set(key: string, value: any, options?: any) {
    const client = await this.getClient();
    return client.set?.(key, value, options);
  },

  async del(...keys: string[]) {
    const client = await this.getClient();
    return client.del?.(keys);
  },

  async exists(key: string) {
    const client = await this.getClient();
    return client.exists?.(key);
  },

  async scan(cursor: number | string = 0, options?: any) {
    const client = await this.getClient();

    if (typeof client.scan !== 'function') {
      return {
        cursor: 0,
        keys: [],
      };
    }

    return client.scan(cursor as any, options);
  },

  async publish(channel: string, message: string) {
    const client = await this.getClient();
    return client.publish?.(channel, message);
  },

  async subscribe(channel: string, listener: any) {
    const client = await this.getClient();
    return client.subscribe?.(channel, listener);
  },

  duplicate() {
    if (currentClient?.duplicate) {
      return currentClient.duplicate();
    }

    return createStub();
  },

  multi() {
    if (currentClient?.multi) {
      return currentClient.multi();
    }

    return createStub().multi?.();
  },
};

export class RedisService {
  static getInstance(): RedisService {
    return new RedisService();
  }

  async connect(url?: string) {
    await redis.getClient(url);
  }

  getClient(): Promise<RedisLike> {
    return redis.getClient();
  }

  async close() {
    await redis.disconnect();
  }
}

export async function connectRedis() {
  return {
    connect: async (url?: string) => redis.getClient(url),
  };
}

