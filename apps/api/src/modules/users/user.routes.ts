import { Router, Response } from "express";
import { prisma } from "../../config/database";
import { authenticate, AuthRequest } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { updateProfileSchema } from "@tara/zod-schemas";
import { sendSuccess } from "../../utils/response.utils";

const router = Router();
router.use(authenticate);

router.get("/me", async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true, name: true, email: true, phone: true,
      avatar: true, role: true, createdAt: true,
      rider: { select: { id: true, status: true, vehicleType: true, rating: true, isVerified: true } },
      savedAddresses: true,
      _count: { select: { orders: true, notifications: true } },
    },
  });
  sendSuccess(res, user);
});

router.patch("/me", validate(updateProfileSchema), async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
    select: { id: true, name: true, email: true, phone: true, avatar: true, role: true },
  });
  sendSuccess(res, user, "Profile updated");
});

router.get("/me/addresses", async (req: AuthRequest, res: Response) => {
  const addresses = await prisma.savedAddress.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
  sendSuccess(res, addresses);
});

router.post("/me/addresses", async (req: AuthRequest, res: Response) => {
  if (req.body.isDefault) {
    await prisma.savedAddress.updateMany({
      where: { userId: req.user!.id },
      data: { isDefault: false },
    });
  }
  const address = await prisma.savedAddress.create({
    data: { userId: req.user!.id, ...req.body },
  });
  sendSuccess(res, address, "Address saved");
});

router.delete("/me/addresses/:id", async (req: AuthRequest, res: Response) => {
  await prisma.savedAddress.deleteMany({
    where: { id: req.params.id, userId: req.user!.id },
  });
  sendSuccess(res, null, "Address deleted");
});

export default router;
