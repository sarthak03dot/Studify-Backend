import express from "express";
import { createQuestion, getQuestions } from "../controllers/question.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/", protect, createQuestion);
router.get("/", protect, getQuestions);

export default router;
