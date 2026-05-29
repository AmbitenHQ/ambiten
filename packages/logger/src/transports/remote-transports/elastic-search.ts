import { RemoteTransporter } from "../../types";
import { createHttpClient } from "./remote-transport";
import { RemoteTransportOptions } from "./remote-transport";

export interface ElasticTransportOptions extends RemoteTransportOptions {
  index?: string;
}


/**
 * ElasticSearch transport with retry and circuit breaker
 * @param url 
 * @param index 
 * @param options 
 * @returns 
 */
export function createElasticTransport(
  url: string,
  index: string,
  options: ElasticTransportOptions = {}
): RemoteTransporter {
  const client = createHttpClient(options);
  const baseUrl = url.replace(/\/$/, '');

  return async (formattedMessage, entry) => {
    await client.post(`${baseUrl}/${index}/_doc`, {
      '@timestamp': entry.timestamp,
      level: entry.level,
      message: entry.message,
      formattedMessage,
      source: entry.source,
      meta: entry.meta,
      context: entry.context,
      tenantId: entry.context?.tenantId,
      requestId: entry.context?.requestId,
      dbName: entry.context?.dbName,
      collectionName: entry.context?.collectionName,
      operation: entry.context?.operation,
    });
  };
}

