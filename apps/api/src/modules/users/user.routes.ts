import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { sendSuccess } from "../../utils/response.utils";
import { sendEmail } from "../../config/mailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const router = Router();

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  authenticate(req as AuthRequest, res, next);
};

router.use(authMiddleware);

router.get("/me", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      isActive: true,
      createdAt: true,
      savedAddresses: true,
    },
  });
  sendSuccess(res, user);
});

router.patch("/me", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { name, phone } = authReq.body;
  const user = await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { name, phone },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
    },
  });
  sendSuccess(res, user, "Profile mis à jour");
});

router.post("/me/avatar", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { avatar } = authReq.body;
  if (!avatar)
    return res.status(400).json({ success: false, message: "Image requise" });
  const user = await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { avatar },
    select: { id: true, avatar: true },
  });
  sendSuccess(res, user, "Avatar mis à jour");
});

router.delete("/me/avatar", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { avatar: null },
    select: { id: true, avatar: true },
  });
  sendSuccess(res, user, "Avatar supprimé");
});

router.post("/me/change-password", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { currentPassword, newPassword } = authReq.body;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user!.id },
  });
  if (!user?.passwordHash)
    return res
      .status(400)
      .json({
        success: false,
        message: "Impossible de changer le mot de passe",
      });
  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid)
    return res
      .status(400)
      .json({ success: false, message: "Mot de passe actuel incorrect" });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { passwordHash },
  });
  try {
    await sendEmail({
      to: user.email,
      subject: "Mot de passe modifié - TARA DELIVERY",
      html: `<h2>Mot de passe modifié</h2><p>Bonjour ${user.name},</p><p>Votre mot de passe a été modifié avec succès.</p>`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }
  sendSuccess(res, null, "Mot de passe modifié avec succès");
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return sendSuccess(
      res,
      null,
      "Si cet email existe, un lien de réinitialisation a été envoyé",
    );
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 3600000);
  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });
  const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Réinitialisation du mot de passe - TARA DELIVERY",
      html: `<h2>Réinitialisation du mot de passe</h2><p>Bonjour ${user.name},</p><p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p><p>Ce lien expire dans 1 heure.</p>`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }
  sendSuccess(
    res,
    null,
    "Si cet email existe, un lien de réinitialisation a été envoyé",
  );
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const resetRecord = await prisma.passwordReset.findFirst({
    where: { token, usedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });
  if (!resetRecord)
    return res
      .status(400)
      .json({ success: false, message: "Token invalide ou expiré" });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: resetRecord.userId },
    data: { passwordHash },
  });
  await prisma.passwordReset.update({
    where: { id: resetRecord.id },
    data: { usedAt: new Date() },
  });
  try {
    await sendEmail({
      to: resetRecord.user.email,
      subject: "Mot de passe réinitialisé - TARA DELIVERY",
      html: `<h2>Mot de passe réinitialisé</h2><p>Bonjour ${resetRecord.user.name},</p><p>Votre mot de passe a été réinitialisé avec succès.</p>`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }
  sendSuccess(res, null, "Mot de passe réinitialisé avec succès");
});

router.patch("/me/preferences", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  sendSuccess(res, null, "Préférences mises à jour");
});

router.patch("/me/payment-method", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  sendSuccess(res, null, "Méthode de paiement par défaut mise à jour");
});

router.post("/me/deactivate", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const user = await prisma.user.findUnique({
    where: { id: authReq.user!.id },
  });
  try {
    await sendEmail({
      to: user!.email,
      subject: "Désactivation de compte - TARA DELIVERY",
      html: `<h2>Compte désactivé</h2><p>Bonjour ${user!.name},</p><p>Votre compte a été désactivé.</p>`,
    });
  } catch (err) {
    console.error("Email error:", err);
  }
  await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { isActive: false },
  });
  sendSuccess(res, null, "Compte désactivé avec succès");
});

router.get("/me/addresses", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const addresses = await prisma.savedAddress.findMany({
    where: { userId: authReq.user!.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  sendSuccess(res, addresses);
});

router.post("/me/addresses", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { label, street, neighborhood, city, lat, lng, landmark, isDefault } =
    authReq.body;
  if (isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: authReq.user!.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.savedAddress.create({
    data: {
      userId: authReq.user!.id,
      label,
      street,
      neighborhood,
      city: city || "Yaoundé",
      lat,
      lng,
      landmark,
      isDefault: isDefault || false,
    },
  });
  sendSuccess(res, address, "Adresse ajoutée");
});

router.patch("/me/addresses/:id", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { label, street, neighborhood, city, lat, lng, landmark, isDefault } =
    authReq.body;
  if (isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: authReq.user!.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.savedAddress.update({
    where: { id: req.params.id, userId: authReq.user!.id },
    data: { label, street, neighborhood, city, lat, lng, landmark, isDefault },
  });
  sendSuccess(res, address, "Adresse mise à jour");
});

router.delete("/me/addresses/:id", async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  await prisma.savedAddress.deleteMany({
    where: { id: req.params.id, userId: authReq.user!.id },
  });
  sendSuccess(res, null, "Adresse supprimée");
});

router.post(
  "/me/addresses/:id/default",
  async (req: Request, res: Response) => {
    const authReq = req as AuthRequest;
    await prisma.savedAddress.updateMany({
      where: { userId: authReq.user!.id },
      data: { isDefault: false },
    });
    await prisma.savedAddress.update({
      where: { id: req.params.id, userId: authReq.user!.id },
      data: { isDefault: true },
    });
    sendSuccess(res, null, "Adresse par défaut mise à jour");
  },
);

export default router;
