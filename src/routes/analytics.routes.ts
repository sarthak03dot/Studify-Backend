import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import ActivityLog from "../models/ActivityLog";
import User from "../models/User";

const router = Router();

// Get Activity Heatmap Data
router.get("/heatmap", protect, async (req: any, res) => {
    try {
        const heatmap = await ActivityLog.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Transform to { date: count } map or similar if needed, or send as is
        res.json(heatmap.map(h => ({ date: h._id, count: h.count })));
    } catch (error) {
        res.status(500).json({ message: "Error fetching heatmap data" });
    }
});

// Get User Stats
router.get("/stats", protect, async (req: any, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({
            streak: user.streak,
            totalTimeSpent: user.totalTimeSpent,
            notesUploaded: user.notesUploaded,
            dsaUploaded: user.dsaUploaded,
            dsaSolved: user.dsaSolved
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

export default router;
