import 'dotenv/config';
import { createClient, RedisClientType } from 'redis';


type TenraRedisClient = {
  isOpen: boolean;
  connect(): Promise<any>;
  disconnect(): Promise<any>;
  quit?: () => Promise<any>;
  publish(channel: string, message: string): Promise<any>;
  subscribe(channel: string, listener: any): Promise<any>;
  duplicate(): TenraRedisClient;
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

let currentClient: TenraRedisClient | null = null;

type RedisLike = TenraRedisClient & {
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
      }) as TenraRedisClient;

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



// import 'dotenv/config';
// import { createClient, RedisClientType } from 'redis';

// const DEFAULT_RECONNECT = (retries: number) => Math.min(retries * 50, 1000);
// const redisUrl = process.env.REDIS_URI as string | undefined;

// let currentClient: RedisClientType | null = null;

// const createStub = () => ({
//   isOpen: false,
//   connect: async () => Promise.resolve(),
//   disconnect: async () => Promise.resolve(),
//   publish: async () => Promise.resolve(),
//   subscribe: async () => Promise.resolve(),
//   duplicate: () => createStub(),
//   set: async () => Promise.resolve(),
//   exists: async () => Promise.resolve(0),
// });

// export const redis: any = {
//   async get(uri?: string) {
//     if (currentClient && currentClient.isOpen) return currentClient;

//     const url = uri || redisUrl;
//     if (!url) return createStub();

//     try {
//       const client = createClient({ url, socket: { reconnectStrategy: DEFAULT_RECONNECT } }) as RedisClientType;
//       await client.connect();
//       currentClient = client;
//       return client;
//     } catch (err) {
//       return createStub();
//     }
//   },

//   async disconnect() {
//     if (currentClient) {
//       try {
//         if (currentClient.isOpen && typeof currentClient.disconnect === 'function') {
//           await currentClient.disconnect();
//         } else if (currentClient.isOpen && typeof (currentClient as any).quit === 'function') {
//           await (currentClient as any).quit();
//         }
//       } catch (err) {
//         // swallow errors on disconnect
//       }
//     }
//     currentClient = null;
//     return Promise.resolve();
//   },

//   get isOpen() {
//     return !!(currentClient && currentClient.isOpen);
//   },

//   publish: async () => Promise.resolve(),
//   subscribe: async () => Promise.resolve(),
//   duplicate: () => ({
//     isOpen: false,
//     connect: async () => Promise.resolve(),
//     disconnect: async () => Promise.resolve(),
//     publish: async () => Promise.resolve(),
//     subscribe: async () => Promise.resolve(),
//   }),
//   set: async (key: string, value: any, options?: any) => Promise.resolve(),
//   exists: async (key: string) => Promise.resolve(0),
//   multi: () => ({
//     commands: [] as Array<[string, ...any[]]>,
//     incr(command: string) {
//       this.commands.push(['incr', command]);
//       return this;
//     },
//     expire(command: string, seconds: number) {
//       this.commands.push(['expire', command, seconds]);
//       return this;
//     },
//     exec: async () => Promise.resolve([]),
//   }),
// };

// export class RedisService {
//   static getInstance(): RedisService {
//     return new RedisService();
//   }
//   async connect(url?: string) {
//     await redis.get(url);
//   }

//   /**
//  * 
//  * @returns {`Promise<RedisClientType>`} The connected Redis client.
//  * @throws Error if Redis is not connected.
//  */
//   getClient(): Promise<RedisClientType> {
//     return Promise.resolve(redis.get());
//   }
//   async close() {
//     await redis.disconnect();
//   }
// }

// export async function connectRedis() {
//   return {
//     connect: async (url?: string) => await redis.get(url),
//   };
// }

