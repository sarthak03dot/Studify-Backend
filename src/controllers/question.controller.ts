import { Request, Response } from "express";
import Question from "../models/Question";
import User from "../models/User";
import { io } from "../server";

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, difficulty, tags } = req.body;
        const userId = (req as any).user._id;

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
        io.emit("new_question", populatedQuestion);

        res.status(201).json(populatedQuestion);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
    try {
        const questions = await Question.find()
            .populate("author", "name")
            .sort({ createdAt: -1 });
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
