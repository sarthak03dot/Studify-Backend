import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    theme: "light" | "dark";
}

const userSchema = new mongoose.Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        theme: { type: String, enum: ["light", "dark"], default: "light" }
    },
    { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
