import { Request, Response } from "express";
import Question from "../models/Question";
import { io } from "../server";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../utils/AppError";

export const createQuestion = asyncHandler(async (req: any, res: Response) => {
    const { title, description, difficulty, tags } = req.body;
    const userId = req.user._id;

    const newQuestion = new Question({
        title,
        description,
        difficulty,
        tags,
        author: userId
    });

    await newQuestion.save();

    const populatedQuestion = await Question.findById(newQuestion._id).populate("author", "name");

    // Real-time update
    if (io) {
        io.emit("new_question", populatedQuestion);
    }

    sendResponse(res, HttpStatus.CREATED, populatedQuestion, "Question created successfully");
});

export const getQuestions = asyncHandler(async (req: Request, res: Response) => {
    const questions = await Question.find()
        .populate("author", "name")
        .sort({ createdAt: -1 });

    sendResponse(res, HttpStatus.OK, questions, "Questions fetched successfully");
});
