import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../config/jwt";
import { prisma } from "../config/database";
import { UserRole, JwtPayload } from "@tara/types";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    name: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, isActive: true },
      select: { id: true, email: true, role: true, name: true, isActive: true },
    });

    if (!user) {
      res.status(401).json({ success: false, message: "User not found or inactive" });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    if (!roles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireRider = requireRole(UserRole.RIDER);
export const requireCustomer = requireRole(UserRole.CUSTOMER);
export const requireAdminOrRider = requireRole(UserRole.ADMIN, UserRole.RIDER);
