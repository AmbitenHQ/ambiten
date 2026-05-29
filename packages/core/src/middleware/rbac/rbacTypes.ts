export type Role = 'admin' | 'user' | 'viewer';
export type Permission = 'create' | 'read' | 'update' | 'delete';

export const rolePermissions: Record<Role, Permission[]> = {
	admin: ['create', 'read', 'update', 'delete'],
	user: ['create', 'read', 'update'],
	viewer: ['read'],
};