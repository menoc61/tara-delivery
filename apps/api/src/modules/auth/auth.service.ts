import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "../../config/database";
import { generateTokenPair, verifyRefreshToken } from "../../config/jwt";
import { AppError, ConflictError, UnauthorizedError } from "../../middleware/error.middleware";
import { emailService } from "../notifications/email.service";
import {
  RegisterInput,
  LoginInput,
} from "@tara/zod-schemas";
import { UserRole } from "@tara/types";

export const authService = {
  // ── Register ──────────────────────────────────────────
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });
    if (existing) throw new ConflictError("Email already registered");

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        phone: input.phone,
        passwordHash,
        role: UserRole.CUSTOMER,
      },
    });

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});

    const tokens = generateTokenPair(user as any);
    return { user: sanitizeUser(user), tokens };
  },

  // ── Login ─────────────────────────────────────────────
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }
    if (!user.isActive) {
      throw new UnauthorizedError("Account is deactivated");
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedError("Invalid email or password");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user as any);
    return { user: sanitizeUser(user), tokens };
  },

  // ── Google OAuth ──────────────────────────────────────
  async handleGoogleUser(googleProfile: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: googleProfile.id }, { email: googleProfile.email }],
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleProfile.email,
          name: googleProfile.name,
          googleId: googleProfile.id,
          avatar: googleProfile.avatar,
          role: UserRole.CUSTOMER,
          isActive: true,
        },
      });
      emailService.sendWelcomeEmail(user.email, user.name).catch(() => {});
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: googleProfile.id, avatar: googleProfile.avatar },
      });
    }

    if (!user.isActive) throw new UnauthorizedError("Account is deactivated");

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = generateTokenPair(user as any);
    return { user: sanitizeUser(user), tokens };
  },

  // ── Refresh Token ─────────────────────────────────────
  async refreshTokens(refreshToken: string) {
    let payload: { sub: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, isActive: true },
    });
    if (!user) throw new UnauthorizedError("User not found");

    return generateTokenPair(user as any);
  },

  // ── Forgot Password ───────────────────────────────────
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return; // Silent fail for security

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordReset.create({
      data: { userId: user.id, token, expiresAt },
    });

    await emailService.sendPasswordResetEmail(user.email, user.name, token);
  },

  // ── Reset Password ────────────────────────────────────
  async resetPassword(token: string, password: string) {
    const reset = await prisma.passwordReset.findFirst({
      where: { token, usedAt: null, expiresAt: { gt: new Date() } },
    });

    if (!reset) throw new AppError("Invalid or expired reset token", 400);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: reset.userId },
        data: { passwordHash },
      }),
      prisma.passwordReset.update({
        where: { id: reset.id },
        data: { usedAt: new Date() },
      }),
    ]);
  },

  // ── Get current user ──────────────────────────────────
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        rider: { select: { id: true, status: true, vehicleType: true, rating: true } },
        admin: { select: { id: true, permissions: true } },
      },
    });
    if (!user) throw new UnauthorizedError("User not found");
    return sanitizeUser(user);
  },
};

const sanitizeUser = (user: Record<string, unknown>) => {
  const { passwordHash: _, ...safe } = user as { passwordHash?: string } & Record<string, unknown>;
  return safe;
};
