[**ambiten**](../../README.md)

***

[ambiten](../../README.md) / logger/src

# logger/src

Main entry point for the Ambiten Logger package.

Exports the logger factory, transport implementations,
logger types, and resilience utilities.

## Classes

- [AdvancedRollingFileTransporter](classes/AdvancedRollingFileTransporter.md)
- [AsyncBatchTransporter](classes/AsyncBatchTransporter.md)
- [BufferedTransporter](classes/BufferedTransporter.md)
- [FileTransporter](classes/FileTransporter.md)
- [MetricsTracker](classes/MetricsTracker.md)

## Interfaces

- [AsyncBatchTransporterOptions](interfaces/AsyncBatchTransporterOptions.md)
- [ILogger](interfaces/ILogger.md)
- [LogEntry](interfaces/LogEntry.md)
- [LoggerConfig](interfaces/LoggerConfig.md)
- [LoggerContextSnapshot](interfaces/LoggerContextSnapshot.md)
- [LoggerFormatOptions](interfaces/LoggerFormatOptions.md)
- [LoggerHooks](interfaces/LoggerHooks.md)
- [LogMeta](interfaces/LogMeta.md)
- [Transporter](interfaces/Transporter.md)

## Type Aliases

- [LoggerContextProvider](type-aliases/LoggerContextProvider.md)
- [LoggerTransportConfig](type-aliases/LoggerTransportConfig.md)
- [LogLevel](type-aliases/LogLevel.md)
- [RemoteTransporter](type-aliases/RemoteTransporter.md)

## Variables

- [DefaultLogger](variables/DefaultLogger.md)
- [SilentLogger](variables/SilentLogger.md)

## Functions

- [consoleTransport](functions/consoleTransport.md)
- [createCircuitBreaker](functions/createCircuitBreaker.md)
- [createElasticTransport](functions/createElasticTransport.md)
- [createFileTransporter](functions/createFileTransporter.md)
- [createHttpTransport](functions/createHttpTransport.md)
- [createLogger](functions/createLogger.md)
- [createLokiTransport](functions/createLokiTransport.md)
- [createResilientTransporter](functions/createResilientTransporter.md)
- [createRotatingFileTransporter](functions/createRotatingFileTransporter.md)
- [resolveLoggerTransports](functions/resolveLoggerTransports.md)
- [retryWithBackoff](functions/retryWithBackoff.md)
- [setupLogger](functions/setupLogger.md)
