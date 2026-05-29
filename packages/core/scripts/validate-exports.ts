import path from "path";
import { colorize } from "../../core/src/utils/color-palatte";


(async () => {
  try {
    const buildPath = path.resolve(__dirname, '../TENRA_core.node.js');

    async function resolvePath(p: string) {

      const TENRA = await import(buildPath);

      const requiredExports = [
        'TENRABootstrap',
        'TENRABootstrapFactory',
        'TENRASchema',
        'TENRAModel',
        'createModel',
        'createSchema',
        'TENRAGraphQL',
        'TENRAClient',
        'applyMultitenancy',
        'connectRedis',
        'initializeRedis',
        'initMultiTenancy',
        'RedisService',
      ];

      const missing = requiredExports.filter(key => !(key in TENRA));

      if (missing.length > 0) {
        console.error(colorize('❌ Missing exports in @TENRA/core build:', 'red'));
        for (const name of missing) {
          console.error(`- ${name}`);
        }
        process.exit(1);
      }

      console.log(colorize('✅ All required exports are present in @TENRA/core.', 'red'));
      return path.isAbsolute(p) ? p : path.join(__dirname, p);
    }
    resolvePath(buildPath);
  } catch (err) {
    console.error(colorize('❌ Failed to load @TENRA/core build output:', 'red'), err);
    process.exit(1);
  }
})()
