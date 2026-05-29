import { FileTransporter } from '../transports';
import { LogEntry } from '../types';
import * as fs from 'fs';

const createEntry = (): LogEntry => ({
  timestamp: new Date().toISOString(),
  level: 'info',
  message: 'Test log message',
  meta: { foo: 'bar' },
});

describe('FileTransporter', () => {
  let transporter: FileTransporter;
  let mockStream: fs.WriteStream;
  let writeMock: jest.Mock;
  let endMock: jest.Mock;

  beforeEach(() => {
    writeMock = jest.fn((_chunk, callback?: (error?: Error | null) => void) => {
      callback?.();
      return true;
    });

    endMock = jest.fn((callback?: () => void) => {
      callback?.();
      return mockStream;
    });

    mockStream = {
      write: writeMock,
      end: endMock,
      once: jest.fn(),
    } as unknown as fs.WriteStream;

    transporter = new FileTransporter(mockStream);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should write formatted log messages to the file', async () => {
    await transporter.write(
      createEntry(),
      '[INFO] Test log message'
    );

    expect(writeMock).toHaveBeenCalledTimes(1);
    expect(writeMock).toHaveBeenCalledWith(
      '[INFO] Test log message\n',
      expect.any(Function)
    );
  });

  it('should not add another newline if formatted message already ends with newline', async () => {
    await transporter.write(
      createEntry(),
      '[INFO] Test log message\n'
    );

    expect(writeMock).toHaveBeenCalledTimes(1);
    expect(writeMock).toHaveBeenCalledWith(
      '[INFO] Test log message\n',
      expect.any(Function)
    );
  });

  it('should close the stream', async () => {
    await transporter.close();

    expect(endMock).toHaveBeenCalledTimes(1);
  });
});