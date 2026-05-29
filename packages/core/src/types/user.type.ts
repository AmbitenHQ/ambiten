/**
 * Represents a user with a specific role.
 */
export type User = {
	/**
	 * The role of the user.
	 */
	id: string
	role: 'admin' | 'user';
};
