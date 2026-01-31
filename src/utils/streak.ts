import User from "../models/User";
import { io } from "../server";

export const updateStreak = async (userId: string) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const now = new Date();
        const lastActive = new Date(user.streak.lastActiveDate);

        // Normalize to midnight for day comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const lastDate = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime();

        const oneDay = 24 * 60 * 60 * 1000;
        const diffDays = (today - lastDate) / oneDay;

        let streakUpdated = false;

        if (diffDays === 1) {
            // Consecutive day
            user.streak.count += 1;
            user.streak.lastActiveDate = now;
            streakUpdated = true;
        } else if (diffDays > 1) {
            // Missed a day
            user.streak.count = 1;
            user.streak.lastActiveDate = now;
            streakUpdated = true;
        } else {
            // Same day
            user.streak.lastActiveDate = now;
            // No streak change, but maybe calendar update needed if first time today?
        }

        // --- CALENDAR LOGIC ---
        // user.streakCalendar is [{ date: Date, active: boolean }]
        // Check if today is already in calendar
        const todayStr = new Date(today).toISOString().split('T')[0];
        const alreadyLogged = user.streakCalendar.some(entry =>
            new Date(entry.date).toISOString().split('T')[0] === todayStr
        );

        if (!alreadyLogged) {
            user.streakCalendar.push({ date: now, active: true });
            streakUpdated = true; // Effectively an update
        }

        await user.save();

        if (streakUpdated) {
            io.emit("streak_update", {
                userId: user.id,
                streak: user.streak,
                streakCalendar: user.streakCalendar
            });
        }

    } catch (error) {
        console.error("Error updating streak:", error);
    }
};
