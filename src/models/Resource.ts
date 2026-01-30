import mongoose, { Schema, Document } from 'mongoose';

export interface IResource extends Document {
    title: string;
    description: string;
    type: 'note' | 'syllabus' | 'paper';
    branch: string;
    subject: string;
    fileUrl: string;
    uploadedBy: mongoose.Types.ObjectId;
    year: number;
    createdAt: Date;
}

const ResourceSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ['note', 'syllabus', 'paper'], required: true },
    branch: { type: String, required: true },
    subject: { type: String, required: true },
    year: { type: Number, required: true, enum: [1, 2, 3, 4] },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IResource>('Resource', ResourceSchema);
