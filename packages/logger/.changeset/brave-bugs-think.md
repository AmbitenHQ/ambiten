---
"@TENRA/logger": major
---

Rotating file transporter interface created to handle daily, hourly e.t.c Rotating logs, display metrics, and flush when maxSize limit is reached or exceeded

The TENRALogger class is now call inside the createRotatingFileTransport() function as built-in which eliminates the user of Streamroller which was formlly use to enable this functionality. Since TENRA_utils logger has now built it personal rotating logger class (TENRALogger) there was no need to continue supporting the use of streamroller. This has thus mitigate possible bug issues that usually may arise from the use of third-party libraries.

Now you could consume the expose (logger) which implements TENRALogger like this

```ts
await logger.log('User signed in', 'info');
await logger.log('Low memory warning', 'warn');
await logger.log('Something crashed!', 'error');
logger.close();

//OR
/**
 *  Implement it yourself like so
*/
const rollingTransport = new AdvancedRollingFileTransporter({
  filename: path.join(__dirname, '../logs/TENRA.log'),
  frequency: 'daily',
  maxSize: 5 * 1024 * 1024,
  backupCount: 10,
  compress: true,
  flushInterval: 2000,
});

export const logger = {
  log: async (msg: string) => {
    await rollingTransport.write(`[${new Date().toISOString()}] ${msg}`);
  },
  close: () => rollingTransport.close()
};
```

or you can use the advanced (setupLogger) to get more advance settings option to the logger. See [GitHub repo](https://github.com/NodEm9/TENRA_utils) for homepage for more on how to set it up or visit the [docs]()
