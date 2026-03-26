import jwt from "jsonwebtoken";
import { JwtPayload, UserRole } from "@tara/types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "fallback_refresh_secret";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export const signAccessToken = (payload: {
  sub: string;
  email: string;
  role: UserRole;
}): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};

export const verifyRefreshToken = (token: string): { sub: string } => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as { sub: string };
};

export const generateTokenPair = (user: {
  id: string;
  email: string;
  role: UserRole;
}) => ({
  accessToken: signAccessToken({ sub: user.id, email: user.email, role: user.role }),
  refreshToken: signRefreshToken(user.id),
});
