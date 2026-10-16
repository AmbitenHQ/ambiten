import type { LoggerTransportConfig } from "@ambiten/logger";

export const DEFAULT_BOOTSTRAP_LOG_FILENAME = "./logs/ambiten.log";

/** Fresh objects on each call so normalization never mutates shared defaults. */
export function defaultBootstrapTransportConfigs(): LoggerTransportConfig[] {
  return [
    { type: "console", options: {} },
    {
      type: "rotating-file",
      options: {
        filename: DEFAULT_BOOTSTRAP_LOG_FILENAME,
        frequency: "daily",
        compress: false,
        flushInterval: 1000,
      },
    },
  ];
}

/** Core-managed logging always includes a file destination. */
export function resolveBootstrapTransportConfigs(
  transports?: readonly LoggerTransportConfig[],
): LoggerTransportConfig[] {
  const configured = transports?.length
    ? [...transports]
    : defaultBootstrapTransportConfigs();

  if (
    !configured.some(
      (transport) =>
        transport.type === "file" || transport.type === "rotating-file",
    )
  ) {
    configured.push(
      ...defaultBootstrapTransportConfigs().filter(
        (transport) => transport.type === "rotating-file",
      ),
    );
  }

  return configured;
}




// import type { LoggerTransportConfig } from "@ambiten/logger";

// /** Fresh objects on each call so normalization never mutates shared defaults. */
// export function defaultBootstrapTransportConfigs(): LoggerTransportConfig[] {
//   return [
//     { type: "console", options: {} },
//     {
//       type: "rotating-file",
//       options: {
//         filename: "./logs/ambiten.log",
//         frequency: "daily",
//         compress: false,
//         flushInterval: 1000,
//       },
//     },
//   ];
// };



// /** Core-managed logging always includes a file destination. */
// export function resolveBootstrapTransportConfigs(
//   transports?: readonly LoggerTransportConfig[],
// ): LoggerTransportConfig[] {
//   const configured = transports?.length
//     ? [...transports]
//     : defaultBootstrapTransportConfigs();

//   if (
//     !configured.some(
//       (transport) =>
//         transport.type === "file" || transport.type === "rotating-file",
//     )
//   ) {
//     configured.push(
//       ...defaultBootstrapTransportConfigs().filter(
//         (transport) => transport.type === "rotating-file",
//       ),
//     );
//   }

//   return configured;
// }

