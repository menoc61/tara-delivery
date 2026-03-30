import nodemailer from "nodemailer";
import { logger } from "../../config/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM =
  process.env.EMAIL_FROM || "TARA DELIVERY <noreply@tara-delivery.cm>";
const BASE_URL = process.env.CORS_ORIGIN || "http://localhost:3000";

const sendMail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info(`Email sent: ${subject} → ${to}`);
  } catch (err) {
    logger.error(`Email failed: ${subject} → ${to}`, err);
    throw err;
  }
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TARA DELIVERY</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
    .container { max-width:600px; margin:40px auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #FF6B2C, #FF8C00); padding:32px; text-align:center; }
    .header h1 { color:#fff; margin:0; font-size:24px; font-weight:800; letter-spacing:1px; }
    .header p { color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px; }
    .body { padding:40px 32px; }
    .body h2 { color:#1a1a1a; font-size:20px; margin:0 0 16px; }
    .body p { color:#555; line-height:1.7; margin:0 0 16px; font-size:15px; }
    .info-box { background:#FFF7F3; border-left:4px solid #FF6B2C; padding:16px 20px; border-radius:0 8px 8px 0; margin:20px 0; }
    .info-box p { margin:4px 0; font-size:14px; color:#333; }
    .btn { display:inline-block; background:#FF6B2C; color:#fff; padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; font-size:15px; margin:20px 0; }
    .status { display:inline-block; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:600; }
    .status-delivered { background:#D1FAE5; color:#065F46; }
    .status-pending { background:#FEF3C7; color:#92400E; }
    .status-cancelled { background:#FEE2E2; color:#991B1B; }
    .footer { background:#F9FAFB; padding:24px 32px; text-align:center; border-top:1px solid #E5E7EB; }
    .footer p { color:#9CA3AF; font-size:12px; margin:4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 TARA DELIVERY</h1>
      <p>Livraison rapide à Yaoundé</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TARA DELIVERY — Yaoundé, Cameroun</p>
      <p>Des questions? Contactez-nous: support@tara-delivery.cm</p>
    </div>
  </div>
</body>
</html>`;

export const emailService = {
  async sendWelcomeEmail(to: string, name: string) {
    const html = baseTemplate(`
      <h2>Bienvenue, ${name}! 🎉</h2>
      <p>Votre compte TARA DELIVERY a été créé avec succès. Vous pouvez maintenant commander des livraisons rapides et sûres à Yaoundé.</p>
      <div class="info-box">
        <p>✅ Compte actif</p>
        <p>📍 Zone de couverture: Yaoundé et environs</p>
        <p>💳 Paiements: MTN MoMo, Orange Money, Cash</p>
      </div>
      <a href="${BASE_URL}/customer" class="btn">Commencer une livraison →</a>
    `);
    return sendMail(to, "Bienvenue sur TARA DELIVERY 📦", html);
  },

  async sendOrderConfirmation(
    to: string,
    name: string,
    order: {
      orderNumber: string;
      type: string;
      deliveryFee: number;
      estimatedDuration?: number | null;
    },
  ) {
    const html = baseTemplate(`
      <h2>Commande confirmée ✅</h2>
      <p>Bonjour ${name}, votre commande a été reçue et est en cours de traitement.</p>
      <div class="info-box">
        <p><strong>N° Commande:</strong> ${order.orderNumber}</p>
        <p><strong>Type:</strong> ${order.type}</p>
        <p><strong>Frais de livraison:</strong> ${order.deliveryFee.toLocaleString()} XAF</p>
        ${order.estimatedDuration ? `<p><strong>Durée estimée:</strong> ${order.estimatedDuration} minutes</p>` : ""}
      </div>
      <a href="${BASE_URL}/customer/orders" class="btn">Suivre ma commande →</a>
    `);
    return sendMail(to, `Commande ${order.orderNumber} confirmée`, html);
  },

  async sendOrderDelivered(to: string, name: string, orderNumber: string) {
    const html = baseTemplate(`
      <h2>Livraison effectuée! 🎊</h2>
      <p>Bonjour ${name}, votre commande <strong>${orderNumber}</strong> a été livrée avec succès.</p>
      <p>Merci de faire confiance à TARA DELIVERY. N'hésitez pas à laisser une évaluation pour votre livreur!</p>
      <a href="${BASE_URL}/customer/orders" class="btn">Évaluer la livraison ⭐</a>
    `);
    return sendMail(to, `Commande ${orderNumber} livrée avec succès!`, html);
  },

  async sendPaymentConfirmation(
    to: string,
    name: string,
    data: {
      orderNumber: string;
      amount: number;
      method: string;
    },
  ) {
    const html = baseTemplate(`
      <h2>Paiement reçu ✅</h2>
      <p>Bonjour ${name}, votre paiement a été confirmé.</p>
      <div class="info-box">
        <p><strong>Commande:</strong> ${data.orderNumber}</p>
        <p><strong>Montant:</strong> ${data.amount.toLocaleString()} XAF</p>
        <p><strong>Méthode:</strong> ${data.method.replace(/_/g, " ")}</p>
      </div>
    `);
    return sendMail(to, `Paiement confirmé pour ${data.orderNumber}`, html);
  },

  async sendPasswordResetEmail(to: string, name: string, token: string) {
    const resetUrl = `${BASE_URL}/auth/reset-password?token=${token}`;
    const html = baseTemplate(`
      <h2>Réinitialisation du mot de passe</h2>
      <p>Bonjour ${name}, vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p>Ce lien expire dans <strong>1 heure</strong>.</p>
      <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
      <p style="color:#9CA3AF;font-size:13px;margin-top:20px;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `);
    return sendMail(
      to,
      "Réinitialisation de votre mot de passe TARA DELIVERY",
      html,
    );
  },

  async sendRiderNewOrderAlert(to: string, name: string, orderNumber: string) {
    const html = baseTemplate(`
      <h2>Nouvelle commande disponible! 🛵</h2>
      <p>Bonjour ${name}, une nouvelle commande <strong>${orderNumber}</strong> est disponible pour vous.</p>
      <a href="${BASE_URL}/rider" class="btn">Voir la commande →</a>
    `);
    return sendMail(to, `Nouvelle commande ${orderNumber}`, html);
  },

  async sendMaintenanceNotification(
    to: string,
    name: string,
    data: {
      scheduledStart: Date;
      scheduledEnd: Date;
      reason?: string;
    },
  ) {
    const startTime = data.scheduledStart.toLocaleString("fr-CM", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const endTime = data.scheduledEnd.toLocaleString("fr-CM", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
    const duration = Math.round(
      (data.scheduledEnd.getTime() - data.scheduledStart.getTime()) /
        (1000 * 60),
    );

    const html = baseTemplate(`
      <div style="background:#FEF3C7; border-left:4px solid #F59E0B; padding:16px; border-radius:0 8px 8px 0; margin-bottom:24px;">
        <p style="color:#92400E; font-weight:700; margin:0;">⚠️ Maintenance planifiée</p>
      </div>
      <h2>Maintenance programmée</h2>
      <p>Bonjour ${name}, nous vous informons qu'une maintenance est planifiée sur notre plateforme.</p>
      <div class="info-box">
        <p><strong>Début:</strong> ${startTime}</p>
        <p><strong>Fin estimée:</strong> ${endTime}</p>
        <p><strong>Durée estimée:</strong> ${duration} minutes</p>
        ${data.reason ? `<p><strong>Motif:</strong> ${data.reason}</p>` : ""}
      </div>
      <p>Pendant cette période, le service sera temporairement indisponible. Nous vous recommandons de:</p>
      <ul style="color:#555; line-height:1.8; padding-left:20px;">
        <li>Planifier vos livraisons avant ou après la maintenance</li>
        <li>Sauvegarder vos commandes en cours</li>
        <li>Contacter le support pour toute urgence</li>
      </ul>
      <p>Nous nous excusons pour la gêne occasionnée et vous remercions de votre compréhension.</p>
    `);
    return sendMail(to, "Maintenance planifiée - TARA DELIVERY", html);
  },

  async sendRatingReminder(to: string, name: string, orderNumber: string) {
    const html = baseTemplate(`
      <h2>Votre avis compte pour nous! ⭐</h2>
      <p>Bonjour ${name}, nous espérons que votre livraison <strong>${orderNumber}</strong> s'est bien passée.</p>
      <p>Votre évaluation nous aide à améliorer notre service et à récompenser les meilleurs livreurs.</p>
      <a href="${BASE_URL}/customer/orders" class="btn">Évaluer maintenant ⭐</a>
      <p style="color:#9CA3AF;font-size:13px;margin-top:20px;">Cela ne prend que quelques secondes!</p>
    `);
    return sendMail(
      to,
      `Comment s'est passée votre livraison ${orderNumber}?`,
      html,
    );
  },
};
