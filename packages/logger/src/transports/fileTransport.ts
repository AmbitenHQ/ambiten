import fs from 'fs';
import path from 'path';
import { LogEntry, Transporter } from '../types';

export class FileTransporter implements Transporter {
  constructor(private readonly stream: fs.WriteStream) {}

  public async write(_entry: LogEntry, formatted: string): Promise<void> {
    const line = formatted.endsWith('\n') ? formatted : `${formatted}\n`;

    await new Promise<void>((resolve, reject) => {
      this.stream.write(line, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  public async flush(): Promise<void> {
    await new Promise<void>((resolve) => {
      this.stream.write('', () => resolve());
    });
  }

  public async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.stream.once('error', reject);
      this.stream.end(() => resolve());
    });
  }
}

export const createFileTransporter = (filePath: string): FileTransporter => {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const stream = fs.createWriteStream(filePath, { flags: 'a' });

  return new FileTransporter(stream);
};