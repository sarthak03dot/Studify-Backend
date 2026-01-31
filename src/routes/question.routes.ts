import express from "express";
import { createQuestion, getQuestions } from "../controllers/question.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { createQuestionSchema } from "../utils/validationSchemas";

const router = express.Router();

router.post("/", protect, validate(createQuestionSchema), createQuestion);
router.get("/", protect, getQuestions);

export default router;
