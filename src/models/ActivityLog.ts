import mongoose, { Document, Schema } from "mongoose";

export interface IActivityLog extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    eventType: "login" | "view-note" | "upload-note" | "upload-dsa" | "view-dsa";
    timestamp: Date;
    metadata?: Record<string, any>;
}

const activityLogSchema = new Schema<IActivityLog>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        eventType: {
            type: String,
            enum: ["login", "view-note", "upload-note", "upload-dsa", "view-dsa"],
            required: true
        },
        timestamp: { type: Date, default: Date.now },
        metadata: { type: Map, of: Schema.Types.Mixed }
    },
    { timestamps: true }
);

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
