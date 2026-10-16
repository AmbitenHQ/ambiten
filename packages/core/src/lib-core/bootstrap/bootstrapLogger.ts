import fs from "fs";
import path from "path";
import {
  setupLogger,
  SilentLogger,
  type ILogger,
  type LoggerTransportConfig,
} from "@ambiten/logger";
import type { AmbitenConfig } from "../../types";
import { defaultBootstrapTransportConfigs } from "../../config/defaultLoggerTransportConfigs";

/** Resolve file destinations and make them writable before transport construction. */
export async function prepareBootstrapTransportConfigs(
  transports: LoggerTransportConfig[],
  baseDirectory = process.cwd(),
): Promise<LoggerTransportConfig[]> {
  const resolved = transports.map((transport) => {
    if (transport.type !== "file" && transport.type !== "rotating-file") {
      return {
        ...transport,
        options: transport.options ? { ...transport.options } : undefined,
      };
    }
    const filename =
      transport.options?.filename ??
      (transport.type === "rotating-file" ? "./logs/ambiten.log" : undefined);
    if (typeof filename !== "string" || !filename.trim()) {
      throw new Error(
        "[Ambiten] File logger transports require a non-empty options.filename.",
      );
    }
    return {
      ...transport,
      options: {
        ...transport.options,
        filename: path.resolve(baseDirectory, filename),
      },
    };
  }) as LoggerTransportConfig[];

  // Append mode creates a missing file without truncating an existing log.
  for (const transport of resolved) {
    if (transport.type !== "file" && transport.type !== "rotating-file")
      continue;
    const filename = transport.options!.filename!;
    try {
      await fs.promises.mkdir(path.dirname(filename), { recursive: true });
      const handle = await fs.promises.open(filename, "a");
      await handle.close();
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[Ambiten] Cannot prepare log file "${filename}": ${reason}`,
      );
    }
  }
  return resolved;
}

export async function createBootstrapLogger(
  config: AmbitenConfig["logger"] = { transportConfigs: [] },
): Promise<ILogger> {
  // enabled is a core option; @ambiten/logger 1.0.1 does not interpret it.
  if (config.enabled === false) return { ...SilentLogger, fatal() {} };

  // Supplied logger instances own their transports and lifecycle.
  if (config.logger) return config.logger;

  // Preserve executable transports in manual configuration.
  if (config.transports?.length) return setupLogger(config);

  const transportConfigs = await prepareBootstrapTransportConfigs(
    config.transportConfigs?.length
      ? config.transportConfigs
      : defaultBootstrapTransportConfigs(),
  );
  return setupLogger({ ...config, transportConfigs });
}
