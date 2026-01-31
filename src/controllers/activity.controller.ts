import { Response } from "express";
import ActivityLog from "../models/ActivityLog";
import { updateStreak } from "../utils/streak";
import { asyncHandler } from "../utils/asyncHandler";
import { sendResponse } from "../utils/apiResponse";
import { HttpStatus } from "../utils/AppError";

export const logActivity = async (userId: string, eventType: string, metadata: any = {}) => {
    try {
        await ActivityLog.create({
            userId: userId as any,
            eventType,
            metadata
        });

        // Update streak whenever significant activity occurs
        await updateStreak(userId);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

export const getActivities = asyncHandler(async (req: any, res: Response) => {
    const activities = await ActivityLog.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(50);

    sendResponse(res, HttpStatus.OK, activities, "Activities fetched successfully");
});
