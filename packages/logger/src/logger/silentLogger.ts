import { ILogger } from '../types';

export const SilentLogger: ILogger = {
  trace() {},
  debug() {},
  info() {},
  warn() {},
  error() {},
  fatal() {},
  log() {},
  async shutdown() {},
  async stop() {},
  async close() {},
};