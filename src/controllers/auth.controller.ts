import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { generateToken } from "../utils/generateToken";
import { updateStreak } from "../utils/streak";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError, HttpStatus } from "../utils/AppError";
import { sendResponse } from "../utils/apiResponse";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        throw new AppError("User already exists", HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    sendResponse(res, HttpStatus.CREATED, {
        token: generateToken(user.id),
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            streak: user.streak,
            streakCalendar: user.streakCalendar,
            totalTimeSpent: user.totalTimeSpent,
            notesUploaded: user.notesUploaded,
            dsaUploaded: user.dsaUploaded,
            dsaSolved: user.dsaSolved,
            bio: user.bio,
            college: user.college,
            socialHandles: user.socialHandles
        }
    }, "User registered successfully");
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new AppError("Invalid credentials", HttpStatus.BAD_REQUEST);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", HttpStatus.BAD_REQUEST);
    }

    await updateStreak(user.id);

    sendResponse(res, HttpStatus.OK, {
        token: generateToken(user.id),
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            streak: user.streak,
            streakCalendar: user.streakCalendar,
            totalTimeSpent: user.totalTimeSpent,
            notesUploaded: user.notesUploaded,
            dsaUploaded: user.dsaUploaded,
            dsaSolved: user.dsaSolved,
            bio: user.bio,
            college: user.college,
            socialHandles: user.socialHandles
        }
    }, "Login successful");
});

export const getProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
        throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    sendResponse(res, HttpStatus.OK, {
        id: user._id,
        name: user.name,
        email: user.email,
        theme: user.theme,
        streak: user.streak,
        streakCalendar: user.streakCalendar,
        totalTimeSpent: user.totalTimeSpent,
        notesUploaded: user.notesUploaded,
        dsaUploaded: user.dsaUploaded,
        dsaSolved: user.dsaSolved,
        bio: user.bio,
        college: user.college,
        socialHandles: user.socialHandles,
    });
});

export const updateProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    user.name = req.body.name || user.name;
    user.theme = req.body.theme || user.theme;
    user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
    user.college = req.body.college !== undefined ? req.body.college : user.college;

    if (req.body.socialHandles) {
        user.socialHandles = {
            github: req.body.socialHandles.github !== undefined ? req.body.socialHandles.github : user.socialHandles.github,
            leetcode: req.body.socialHandles.leetcode !== undefined ? req.body.socialHandles.leetcode : user.socialHandles.leetcode,
            codeforces: req.body.socialHandles.codeforces !== undefined ? req.body.socialHandles.codeforces : user.socialHandles.codeforces,
        };
    }

    if (req.body.password) {
        user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    sendResponse(res, HttpStatus.OK, {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        theme: updatedUser.theme,
        streak: updatedUser.streak,
        streakCalendar: updatedUser.streakCalendar,
        totalTimeSpent: updatedUser.totalTimeSpent,
        notesUploaded: updatedUser.notesUploaded,
        dsaUploaded: updatedUser.dsaUploaded,
        dsaSolved: updatedUser.dsaSolved,
        questionsSolved: updatedUser.dsaSolved,
        resourcesUploaded: updatedUser.notesUploaded + updatedUser.dsaUploaded,
        bio: updatedUser.bio,
        college: updatedUser.college,
        socialHandles: updatedUser.socialHandles,
        token: generateToken(updatedUser._id.toString()),
    }, "Profile updated successfully");
});

export const changePassword = asyncHandler(async (req: any, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await bcrypt.compare(currentPassword, user.password))) {
        throw new AppError("Invalid current password", HttpStatus.BAD_REQUEST);
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    sendResponse(res, HttpStatus.OK, null, "Password updated successfully");
});

export const solveQuestion = asyncHandler(async (req: any, res: Response) => {
    const { questionId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    if (!questionId) {
        throw new AppError("Question ID is required", HttpStatus.BAD_REQUEST);
    }

    // Initialize if undefined
    if (!user.solvedQuestionIds) {
        user.solvedQuestionIds = [];
    }

    if (user.solvedQuestionIds.includes(questionId)) {
        return sendResponse(res, HttpStatus.OK, {
            id: user._id,
            name: user.name,
            email: user.email,
            theme: user.theme,
            streak: user.streak,
            streakCalendar: user.streakCalendar,
            totalTimeSpent: user.totalTimeSpent,
            notesUploaded: user.notesUploaded,
            dsaUploaded: user.dsaUploaded,
            dsaSolved: user.dsaSolved,
            questionsSolved: user.dsaSolved,
            solvedQuestionIds: user.solvedQuestionIds,
            bio: user.bio,
            college: user.college,
            socialHandles: user.socialHandles
        }, "Question already solved");
    }

    user.solvedQuestionIds.push(questionId);
    user.dsaSolved = (user.dsaSolved || 0) + 1;

    // Update streak as this is an activity
    await updateStreak(user.id);

    const updatedUser = await user.save();

    sendResponse(res, HttpStatus.OK, {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        theme: updatedUser.theme,
        streak: updatedUser.streak,
        streakCalendar: updatedUser.streakCalendar,
        totalTimeSpent: updatedUser.totalTimeSpent,
        notesUploaded: updatedUser.notesUploaded,
        dsaUploaded: updatedUser.dsaUploaded,
        dsaSolved: updatedUser.dsaSolved,
        questionsSolved: updatedUser.dsaSolved,
        solvedQuestionIds: updatedUser.solvedQuestionIds,
        bio: updatedUser.bio,
        college: updatedUser.college,
        socialHandles: updatedUser.socialHandles
    }, "Question marked as solved");
});
