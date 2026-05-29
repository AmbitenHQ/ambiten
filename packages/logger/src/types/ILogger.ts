// types/ILogger.ts
export interface ILogger {
  debug: (message: string, ...meta: any[]) => void;
  info: (message: string, ...meta: any[]) => void;
  warn: (message: string, ...meta: any[]) => void;
  error: (message: string, ...meta: any[]) => void;
  trace: (message: string, ...meta: any[]) => void;

  shutdown?: () => void | Promise<void>;
  stop?: () => void | Promise<void>;
  close?: () => void | Promise<void>;
}