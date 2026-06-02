import { AmbitenContext } from '../context';
import { MultiTenantManager } from '../tanancy';
import type { ModelContext, BootstrapClient } from '../types';

/**
 * Configures the Ambiten runtime context with a transaction client resolver.
 *
 * The resolver is used by {@link AmbitenContext.withTransaction} to obtain the
 * correct MongoDB client for the current runtime scope. Tenant-specific clients
 * are resolved first when a tenant identifier is available; otherwise the
 * configured provider client factory is used.
 *
 * @param provider - Bootstrap client/provider used to resolve MongoDB clients.
 */
export function configureAmbitenContext(provider: BootstrapClient): void {
  AmbitenContext.configureTransactionResolver({
    resolveClient: async (tenantId?: string, dbName?: string) => {
      if (tenantId) {
        const tenantClient = await MultiTenantManager.getClient(tenantId);
        if (tenantClient) {
          return tenantClient;
        }
      }

      if (typeof provider.client === 'function') {
        const ctx: ModelContext = {
          tenantId,
          dbName
        };

        return provider.client(ctx);
      }

      return undefined;
    }
  });
}