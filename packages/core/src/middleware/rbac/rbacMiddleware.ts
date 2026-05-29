import { redis } from '../../redis-manager';
import { Role, Permission, rolePermissions } from './rbacTypes';

function buildCacheKey(role: string | string[] | { tenantId: string } | any, key: string) {
	if (Array.isArray(role)) {
		return `${role.join(',')}:${key}`;
	}
	if (role && typeof role === 'object') {
		if ('tenantId' in role) return `${role.tenantId}:${key}`;
		// If role is actually a role object or other shape, fallback to JSON-safe string
		try {
			const convertCredentials = JSON.parse(JSON.stringify(role));
			return `${convertCredentials}:${key}`;
		} catch (err) {
			return `${String(role)}:${key}`;
		}
	}
	return `${role}:${key}`;
}

declare module "express-serve-static-core" {
	interface Request {
		user: { _id: string; role: string, tenantId: string };
		isAdmin: boolean;
		isUser: boolean;
	}
};


// const tenantCache: Map<string, any> = new Map();

/**
 * Check if a user has a specific permission
 * @param role The role of the user
 * @param permission The permission to check
 * @returns A promise that resolves to true if the user has the permission, false otherwise
 * @example
 * const hasPermission = await checkPermission('admin', 'createUser');
 * if (hasPermission) {
 * // User has permission to create a user
 * } else {
 * // User does not have permission to create a user
 * }
 */
export async function checkPermission(role: Role, permission: Permission): Promise<boolean> {
	const cacheKey = buildCacheKey(role, 'permissions');
	let allowedActions = await getCachedData(role, 'permissions');

	if (!allowedActions) {
		console.info(`Cache miss for role "${role}". Fetching permissions...`);
		// Fetch permissions from the rolePermissions object
		allowedActions = rolePermissions[role] || [];
		if (allowedActions.length > 0) {
			console.info(`Permissions found for role "${role}": ${allowedActions.join(', ')}`);
		} else {
			console.warn(`No permissions found for role "${role}"`);
		}
	};

	const cacheExists = await redis.exists(cacheKey);
	if (cacheExists) {
		console.info(`Cache hit for role "${role}"`);
	}
	
	// If allowedActions is not already cached, set it

	if (allowedActions) {
		allowedActions = Promise.resolve(rolePermissions[role] || []);
		await setCachedData(role, 'permissions', await allowedActions, 500); // Cache for 500s
	}
	return Promise.resolve(rolePermissions[role] || []).then(permissions => {
		if (permissions.includes(permission)) {
			console.info(`Permission granted for role "${role}" to perform action "${permission}"`);
			return true;
		} else {
			console.warn(`Permission denied for role "${role}" to perform action "${permission}"`);
			return false;
		}
	});
}


/** 
 * Get cached data for a specific role and key
 * @param role The role or tenant object
 * @param key The key to retrieve from the cache
 * @return {Promise<any>} A promise that resolves to the cached data or null if not found
 * This function retrieves cached data from Redis based on the provided role and key.
 * It constructs a unique cache key using the role and key, checks if the data exists in the cache,
 * and returns the parsed data if found. If the data is not found, it logs a cache miss and returns null.
 * @throws {Error} If there is an issue with the Redis operation
 * @example
 * // Get cached permissions for role 'admin'
 * const cachedPermissions = await getCachedData('admin', 'permissions');
 * if (cachedPermissions) {
 *   console.log('Cached permissions:', cachedPermissions);
 * } else {
 *  console.log('No cached permissions found');
 * }
 */
export async function getCachedData(
	role: string | string[] | { tenantId: string },
	key: string
): Promise<any> {
	const cacheKey = buildCacheKey(role, key);
	const cachedData = await redis.get(cacheKey);
	if (cachedData) {
		console.info(`Cache hit for key "${cacheKey}"`);
	} else {
		console.warn(`Cache miss for key "${cacheKey}"`);
	}
	try {
		return cachedData ? JSON.parse(JSON.stringify(cachedData)) : null;
	} catch (err) {
		console.warn(`Failed to parse cached data for key ${cacheKey}:`, err);
		// If parsing fails, return raw value to avoid crashing
		return cachedData;
	}
};

export async function setCachedData(
	role: string | string[] | { tenantId: string },
	key: string,
	data: any,
	ttl: number
): Promise<void> {
	// Build a consistent cache key and store JSON-stringified data with TTL
	const cacheKey = buildCacheKey(role, key);
	try {
		await redis?.set(cacheKey, JSON.stringify(data), { EX: ttl });
		console.info(`Cache set for ${cacheKey}:`, data);
	} catch (err) {
		console.error(`Failed to set cache for ${cacheKey}:`, err);
	}

	// Only log permissions if role is a string or array with values
	let roleKey: string | undefined;
	if (typeof role === 'string') {
		roleKey = role;
	} else if (Array.isArray(role) && role.length > 0) {
		roleKey = role[0];
	} else if (role && typeof role === 'object' && 'tenantId' in role) {
		roleKey = role.tenantId as string;
	}

	if (roleKey) {
		const permissions = rolePermissions[roleKey] || [];
		if (permissions.length > 0) {
			console.info(`Permissions cached for role "${roleKey}": ${permissions.join(', ')}`)
		} else {
			console.warn(`No permissions found for role "${roleKey}" to cache`)
		}
	} else {
		console.warn(`Role key is not a string, cannot cache permissions`);
	}

	return;
}

/**
 * Invalidate the cache for a specific tenant and role
 * @param tenantId The ID of the tenant
 * @param role The role to invalidate cache for
 * @return {Promise<void>} 
 * This function removes the cached permissions for the specified tenant and role.
 * It is useful when permissions change and you want to ensure the cache reflects the latest state.
 * It logs the invalidation action and deletes the cache entry from Redis.
 * This is particularly important in multi-tenant applications where each tenant may have different permissions.
 * @throws {Error} If there is an issue with the Redis operation
 * @example
 * // Invalidate cache for tenant 'tenant123' with role 'admin'
 * await invalidateTenantCache('tenant123', 'admin');
 */
export async function invalidateTenantCache(tenantId: string, role: string): Promise<void> {
	try {
		const cacheKey = `${tenantId}:permissions:${role}`;
		const cacheExists = await redis.exists(cacheKey);
		if (cacheExists) {
			await redis.del(cacheKey);
			console.info(`Cache invalidated for tenant ${tenantId} and role ${role}`);
		} else {
			console.warn(`No cache found for tenant ${tenantId} and role ${role}`);
		}
	} catch (error) {
		console.error(`Error invalidating cache for tenant ${tenantId} and role ${role}:`, error);
		throw new Error(`Failed to invalidate cache for tenant ${tenantId} and role ${role}`);
	}
	return;
}

/**
 * Middleware to enforce RBAC (Role-Based Access Control) on GraphQL resolvers
 * @param resolver The original resolver function
 * @param permission The required permission for the action
 * @returns A wrapped resolver function that checks permissions
 * @throws {Error} If the user does not have the required permission
 * @example
 * // Wrap a resolver with RBAC enforcement
 * const securedResolver = enforceRBAC(originalResolver, 'createUser');
 * 
 * // Use the secured resolver in your GraphQL schema
 * const resolvers = {
 *   Mutation: {
 *     createUser: securedResolver,
 * 	}, };
 * 
 * In this example, the `enforceRBAC` function wraps the `originalResolver` and checks if the user has the 'createUser' permission before allowing access to the resolver. If the user lacks the required permission, an error is thrown, preventing unauthorized access.
 * * This middleware is essential for implementing fine-grained access control in GraphQL APIs, ensuring that only authorized users can perform specific actions based on their roles and permissions.
 * @remarks This function is designed to be used in GraphQL resolvers to enforce role-based access control (RBAC). It checks if the user has the necessary permissions before allowing access to the resolver function. If the user lacks the required permission, an error is thrown, preventing unauthorized access.
 * * @see {@link checkPermission} for checking user permissions
 * * @see {@link Role} and {@link Permission} for role and permission types
 * * @see {@link rolePermissions} for the mapping of roles to permissions
 * * @see {@link getCachedData} and {@link setCachedData} for caching permissions
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function enforceRBAC(resolver: Function, permission: Permission) {
	const wrapped = async (parent: any, args: any, context: any, info: any) => {
		const { user } = context;
		// Ensure we pass the user's role (string) and await the async permission check
		if (!user || !(await checkPermission(user.role as Role, permission))) {
			throw new Error('Unauthorized: You do not have permission to perform this action.');
		}

		return await resolver(parent, args, context, info);
	};

	// Preserve function name (useful for logging, debugging)
	Object.defineProperty(wrapped, 'name', {
		value: resolver.name || 'anonymous',
		writable: false,
		configurable: true,
	});

	// Attach metadata
	(wrapped as any).__originalResolver = resolver;
	(wrapped as any).__rbacAction = permission;

	return wrapped;
}


/**
 * Get the RBAC action from a wrapped resolver
 * @param resolver The wrapped resolver function
 * @returns The RBAC action
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getRBACAction(resolver: Function) {
	return (resolver as any).__rbacAction || null;
}


/**
 * Get the original resolver function from a wrapped resolver
 * @param resolver The wrapped resolver function
 * @returns The original resolver function
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function getOriginalResolver(resolver: Function) {
	return (resolver as any).__originalResolver || resolver;
}