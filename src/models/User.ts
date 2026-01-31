import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    theme: "light" | "dark";
    streak: {
        count: number;
        lastActiveDate: Date;
    };
    streakCalendar: { date: Date; active: boolean }[];
    totalTimeSpent: number; // in minutes
    notesUploaded: number;
    dsaUploaded: number;
    dsaSolved: number;
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        theme: { type: String, enum: ["light", "dark"], default: "light" },
        streak: {
            count: { type: Number, default: 0 },
            lastActiveDate: { type: Date, default: Date.now }
        },
        streakCalendar: [
            {
                date: { type: Date, required: true },
                active: { type: Boolean, default: true }
            }
        ],
        totalTimeSpent: { type: Number, default: 0 },
        notesUploaded: { type: Number, default: 0 },
        dsaUploaded: { type: Number, default: 0 },
        dsaSolved: { type: Number, default: 0 }
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
