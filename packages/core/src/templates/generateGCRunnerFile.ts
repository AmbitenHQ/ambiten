export function generateGCRunner(): string {
  return `/**
 * Garbage collector runner
 *
 * Replace the imports below with your actual bootstrap/model entry points.
 */

import { runGarbageCollector } from './gcManager';
// import { UserModel } from '../models/UserModel';

async function main() {
  // Example:
  // await runGarbageCollector(UserModel, { retentionPeriod: 7 });
  console.log('⚠️  Update gcRunner.ts with your model imports before using it.');
}

main().catch((error) => {
  console.error('❌ Garbage collector failed:', error);
  process.exit(1);
});
`;
}