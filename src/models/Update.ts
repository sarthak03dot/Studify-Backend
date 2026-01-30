import mongoose, { Schema, Document } from 'mongoose';

export interface IUpdate extends Document {
    title: string;
    message: string;
    type: 'info' | 'alert' | 'new_content';
    createdAt: Date;
}

const UpdateSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'alert', 'new_content'], default: 'info' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUpdate>('Update', UpdateSchema);
