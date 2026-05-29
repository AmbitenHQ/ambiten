const intervals = new Set<NodeJS.Timeout>();
const timeouts = new Set<NodeJS.Timeout>();


export function registerInterval(id: NodeJS.Timeout) {
  intervals.add(id);
  return id;
}


export function registerTimeout(id: NodeJS.Timeout) {
  timeouts.add(id);
  return id;
}

/**
 * Clears all registered intervals and timeouts.
 * This is useful for cleanup, especially in tests or when shutting down the application.
 */
export async function clearAllTimers() {
  try {
    for (const id of intervals) clearInterval(id);
    for (const id of timeouts) clearTimeout(id);

    intervals.clear();
    timeouts.clear();
    process.env.TENRA_LOGGER_METRICS_INTERVAL = '0';

  } catch (error) {
    console.error('Error clearing timers:', error);
  }
};

