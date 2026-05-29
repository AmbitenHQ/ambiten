import { MetricsSnapshot, MetricsTrackerOptions } from '../types';
import { clearAllTimers, registerInterval } from './TimerRegistry';

export class MetricsTracker {
  private totalLogs = 0;
  private transportDispatches = 0;
  private successfulTransportWrites = 0;
  private flushedBuffers = 0;
  private rotations = 0;
  private transportErrors = 0;
  private droppedLogs = 0;
  private lastTotalLogs = 0;

  private intervalId?: NodeJS.Timeout;

  private readonly startedAt = new Date();
  private lastSnapshotAt = new Date();

  constructor(private readonly options: MetricsTrackerOptions = {}) { }

  public trackLog(count = 1): void {
    this.totalLogs += count;
  }

  public trackFlush(count = 1): void {
    this.flushedBuffers += count;
  }

  public trackRotation(count = 1): void {
    this.rotations += count;
  }

  public trackTransportDispatch(count = 1): void {
    this.transportDispatches += count;
  }

  public trackSuccessfulTransportWrite(count = 1): void {
    this.successfulTransportWrites += count;
  }

  public trackTransportError(count = 1): void {
    this.transportErrors += count;
  }

  public trackDroppedLog(count = 1): void {
    this.droppedLogs += count;
  }

  public start(interval = this.options.interval ?? 60_000): void {
    if (this.intervalId) return;

    if (this.options.enabled === false) return;

    this.intervalId = registerInterval(
      setInterval(() => {
        const snapshot = this.getSnapshot();

        if (this.options.reporter) {
          this.options.reporter(snapshot);
        } else if (process.env.NODE_ENV !== 'test') {
          console.info('📈 Tenra Logger Metrics:', snapshot);
        }

        this.resetForNextCycle();
      }, interval)
    );
  }

  public async stop(): Promise<void> {
    if (!this.intervalId) return;

    clearInterval(this.intervalId);
    this.intervalId = undefined;

    await clearAllTimers();
  }

  public isTrackingMetrics(): boolean {
    return this.intervalId !== undefined;
  }

  public getSnapshot(): MetricsSnapshot {
    const now = new Date();

    return {
      totalLogs: this.totalLogs,
      transportDispatches: this.transportDispatches,
      successfulTransportWrites: this.successfulTransportWrites,
      flushedBuffers: this.flushedBuffers,
      rotations: this.rotations,
      transportErrors: this.transportErrors,
      droppedLogs: this.droppedLogs,
      logsPerInterval: this.totalLogs - this.lastTotalLogs,
      startedAt: this.startedAt.toISOString(),
      lastSnapshotAt: now.toISOString(),
    };
  }

  private resetForNextCycle(): void {
    this.transportDispatches = 0;
    this.successfulTransportWrites = 0;
    this.flushedBuffers = 0;
    this.rotations = 0;
    this.transportErrors = 0;
    this.droppedLogs = 0;
    this.lastTotalLogs = this.totalLogs;
    this.lastSnapshotAt = new Date();
  }
};