import { Router } from "express";
import { register, login, getProfile, updateProfile, changePassword } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from "../utils/validationSchemas";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

// Protected routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, validate(updateProfileSchema), updateProfile);
router.post("/change-password", protect, validate(changePasswordSchema), changePassword);

export default router;
