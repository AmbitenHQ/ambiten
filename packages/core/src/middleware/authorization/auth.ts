import { Request, Response, NextFunction } from "express-serve-static-core";
import { AuthService } from "../../utils/AuthUtils";


declare module "express-serve-static-core" {
	interface Request {
		user: { _id: string; role: string, tenantId: string };
	}
}

/**
 *  Middleware to authorize access to routes based on user roles.
 *  This middleware checks if the request contains a valid JWT token,
 * @param roles - An array of roles that are allowed to access the route.
 * @returns 
 */
export function authorize(roles: string[]) {
	return (req: Request, res: Response, next: NextFunction) => {
		let token;
		const authHeader = req.headers?.authorization || req.headers.Authorization;
		if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
			token = authHeader.split(' ')[1];
		}

		if (!token) {
			return res.status(401).json({ error: "Access token required" });
		}
		try {
			const decoded = AuthService.verifyToken(token as string) as { _id: string; role: string, tenantId: string };

			console.info(`Decoded token: ${JSON.stringify(decoded)}`);

			if (!decoded) {
				return res.status(401).json({ error: "Unauthorized" });
			}

			if (!roles.includes(decoded.role)) {
				return res.status(403).json({ error: "Access Denied" });
			}

			return decoded;
			next();
		} catch {
			res.status(401).json({ error: "Unauthorized" });
		}
	};
}

