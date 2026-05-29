import type { TenraConfig } from '../types';

export function generateMainTS(options: TenraConfig): string {
  return `import { run } from './core/initTenra';

async function main() {
  const app = await run();

  if (typeof app?.onConnect === 'function') {
     app.onConnect(() => {
      console.log('✅ Tenra application initialized successfully.');
    });
  }

  return app;
}

main().catch((error) => {
  console.error('❌ Failed to start application:', error);
  process.exit(1);
});
`;
}