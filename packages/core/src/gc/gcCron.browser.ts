import { colorize } from "../utils";

export const startGarbageCollector = () => {
  // No-op for browsers
  console.warn(colorize('[GC] Garbage collector is disabled in the browser.', 'red'));
};
