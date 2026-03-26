import { Request, Response } from "express";
import { authService } from "./auth.service";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess, sendCreated } from "../../utils/response.utils";

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    sendCreated(res, result, "Account created successfully");
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    sendSuccess(res, result, "Login successful");
  },

  async googleCallback(req: Request, res: Response) {
    const profile = req.user as {
      id: string; email: string; name: string; avatar?: string;
    };
    const result = await authService.handleGoogleUser(profile);
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.CORS_ORIGIN}/auth/callback?accessToken=${result.tokens.accessToken}&refreshToken=${result.tokens.refreshToken}`;
    res.redirect(redirectUrl);
  },

  async refreshTokens(req: Request, res: Response) {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    sendSuccess(res, tokens, "Tokens refreshed");
  },

  async forgotPassword(req: Request, res: Response) {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, "If the email exists, a reset link has been sent");
  },

  async resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    sendSuccess(res, null, "Password reset successfully");
  },

  async getMe(req: AuthRequest, res: Response) {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  },

  async logout(_req: Request, res: Response) {
    // On JWT we just acknowledge - client removes token
    sendSuccess(res, null, "Logged out successfully");
  },
};
