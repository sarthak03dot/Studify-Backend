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
            dsaSolved: user.dsaSolved
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
            dsaSolved: user.dsaSolved
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
    });
});

export const updateProfile = asyncHandler(async (req: any, res: Response) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        throw new AppError("User not found", HttpStatus.NOT_FOUND);
    }

    user.name = req.body.name || user.name;
    user.theme = req.body.theme || user.theme;

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
