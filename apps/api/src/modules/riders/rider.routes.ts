import { Router, Response } from "express";
import {
  authenticate,
  requireAdmin,
  requireAdminOrRider,
  AuthRequest,
} from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import {
  riderRegistrationSchema,
  updateRiderStatusSchema,
  updateRiderLocationSchema,
  riderFiltersSchema,
  createRatingSchema,
} from "@tara/zod-schemas";
import {
  sendSuccess,
  sendCreated,
  sendPaginated,
} from "../../utils/response.utils";
import { riderService } from "./rider.service";

const router = Router();
router.use(authenticate);

router.post(
  "/register",
  validate(riderRegistrationSchema),
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.register(req.user!.id, req.body);
    sendCreated(res, rider, "Rider profile created");
  },
);

router.get(
  "/me",
  requireAdminOrRider,
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.getMyProfile(req.user!.id);
    sendSuccess(res, rider);
  },
);

router.patch(
  "/me/status",
  requireAdminOrRider,
  validate(updateRiderStatusSchema),
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.updateStatus(
      req.user!.id,
      req.body.status,
    );
    sendSuccess(res, rider, "Status updated");
  },
);

router.patch(
  "/me",
  requireAdminOrRider,
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, rider, "Profile updated");
  },
);

router.post(
  "/me/location",
  requireAdminOrRider,
  validate(updateRiderLocationSchema),
  async (req: AuthRequest, res: Response) => {
    const result = await riderService.updateLocation(
      req.user!.id,
      req.body.location,
    );
    sendSuccess(res, result);
  },
);

router.get(
  "/",
  requireAdmin,
  validate(riderFiltersSchema, "query"),
  async (req: AuthRequest, res: Response) => {
    const filters = req.query as unknown as {
      page: number;
      limit: number;
      status?: string;
      vehicleType?: string;
      isVerified?: boolean;
    };
    const result = await riderService.getAllRiders(filters);
    sendPaginated(res, result.items, result.meta);
  },
);

router.get("/:id", async (req: AuthRequest, res: Response) => {
  const rider = await riderService.getRiderById(req.params.id);
  sendSuccess(res, rider);
});

router.patch(
  "/:id/verify",
  requireAdmin,
  async (req: AuthRequest, res: Response) => {
    const rider = await riderService.verifyRider(
      req.params.id,
      req.body.isVerified,
    );
    sendSuccess(res, rider, "Rider verification updated");
  },
);

router.post(
  "/rate",
  validate(createRatingSchema),
  async (req: AuthRequest, res: Response) => {
    const rating = await riderService.submitRating({
      ...req.body,
      userId: req.user!.id,
    });
    sendCreated(res, rating, "Rating submitted");
  },
);

export default router;
