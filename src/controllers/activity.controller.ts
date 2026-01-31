import { Request, Response } from "express";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";
import { updateStreak } from "../utils/streak";

export const logActivity = async (userId: string, eventType: string, metadata: any = {}) => {
    try {
        await ActivityLog.create({
            userId: userId as any,
            eventType,
            metadata
        });

        // Update streak whenever significant activity occurs
        // Filter if needed (e.g. maybe just 'login' or 'upload', but requirements say any activity)
        await updateStreak(userId);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

export const getActivities = async (req: any, res: Response) => {
    try {
        const activities = await ActivityLog.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities" });
    }
};
