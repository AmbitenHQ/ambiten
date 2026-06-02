import path from "path";
import { colorize } from "../../core/src/utils/color-palatte";


(async () => {
  try {
    const buildPath = path.resolve(__dirname, '../ambiten_core.node.js');

    async function resolvePath(p: string) {

      const ambiten = await import(buildPath);

      const requiredExports = [
        'AmbitenBootstrapFactory',
        'AmbitenSchema',
        'AmbitenModel',
        'createModel',
        'createSchema',
        'AmbitenGraphQL',
        'AmbitenClient',
        'applyMultitenancy',
        'connectRedis',
        'initializeRedis',
        'initMultiTenancy',
        'RedisService',
      ];

      const missing = requiredExports.filter(key => !(key in ambiten));

      if (missing.length > 0) {
        console.error(colorize('❌ Missing exports in @ambiten/core build:', 'red'));
        for (const name of missing) {
          console.error(`- ${name}`);
        }
        process.exit(1);
      }

      console.log(colorize('✅ All required exports are present in @ambiten/core.', 'red'));
      return path.isAbsolute(p) ? p : path.join(__dirname, p);
    }
    resolvePath(buildPath);
  } catch (err) {
    console.error(colorize('❌ Failed to load @ambiten/core build output:', 'red'), err);
    process.exit(1);
  }
})()
