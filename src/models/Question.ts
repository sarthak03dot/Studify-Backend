import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./User";

export interface IQuestion extends Document {
    title: string;
    description: string; // Markdown content
    difficulty: "Easy" | "Medium" | "Hard";
    tags: string[];
    author: IUser["_id"];
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true },
        difficulty: {
            type: String,
            enum: ["Easy", "Medium", "Hard"],
            default: "Medium"
        },
        tags: [{ type: String }],
        author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", questionSchema);
