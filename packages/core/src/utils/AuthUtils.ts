import jwt from "jsonwebtoken";
import 'dotenv/config' 

const SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const REFRESH_EXPIRATION = process.env.REFRESH_EXPIRATION || '7d';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1d';


export class AuthService {
	static generateToken(user: { _id: string; role: string; tenantId: string }) {
		return jwt.sign(user, SECRET, {
			expiresIn: JWT_EXPIRATION
		} as jwt.SignOptions);
	}

 static generateRefreshToken(user: { _id: string; role: string }) {
	 return jwt.sign(
		 user,
		 REFRESH_SECRET,
		 {
			 expiresIn: REFRESH_EXPIRATION
		 } as jwt.SignOptions);
}

	static verifyToken(token: string) {
		return jwt.verify(token, SECRET);
	}
}

