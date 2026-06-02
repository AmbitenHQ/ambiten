import type { AmbitenConfig } from '../types';

export function generateMainTS(options: AmbitenConfig): string {
  return `import { run } from './core/initAmbiten';

async function main() {
  const app = await run();

  if (typeof app?.onConnect === 'function') {
     app.onConnect(() => {
      console.log('✅ Ambiten application initialized successfully.');
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