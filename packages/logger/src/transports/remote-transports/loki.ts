import { RemoteTransporter } from "../../types";
import { createHttpClient, RemoteTransportOptions } from "./remote-transport";

//
export interface LokiTransportOptions extends RemoteTransportOptions {
  labels?: Record<string, string>;
  includeContextLabels?: boolean;
}

export function createLokiTransport(
  pushUrl: string,
  labels: Record<string, string> = {},
  options: LokiTransportOptions = {}
): RemoteTransporter {
  const client = createHttpClient(options);

  return async (formattedMessage, entry) => {
    const streamLabels: Record<string, string> = {
      app: 'tenra',
      level: entry.level,
      ...labels,
    };

    if (options.includeContextLabels ?? true) {
      if (entry.source) streamLabels.source = entry.source;
      if (entry.context?.tenantId) streamLabels.tenantId = entry.context.tenantId;
      if (entry.context?.requestId) streamLabels.requestId = entry.context.requestId;
      if (entry.context?.collectionName) {
        streamLabels.collectionName = entry.context.collectionName;
      }
    }

    await client.post(pushUrl, {
      streams: [
        {
          stream: streamLabels,
          values: [
            [
              `${new Date(entry.timestamp).getTime()}000000`,
              formattedMessage,
              {
                level: entry.level,
                message: entry.message,
                meta: entry.meta,
                context: entry.context,
              },
            ],
          ],
        },
      ],
    });
  };
}