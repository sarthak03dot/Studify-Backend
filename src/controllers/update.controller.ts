import { Request, Response } from 'express';
import Update from '../models/Update';
import { z } from 'zod';

const updateSchema = z.object({
    title: z.string().min(3),
    message: z.string().min(10),
    type: z.enum(['info', 'alert', 'new_content']).optional(),
});

export const createUpdate = async (req: Request, res: Response): Promise<void> => {
    try {
        const validatedData = updateSchema.parse(req.body);
        const update = new Update(validatedData);
        await update.save();

        // Real-time broadcast
        // Use require to avoid circular dependency
        const { io } = require('../server');
        if (io) {
            io.emit('new_update', update);
        }

        res.status(201).json(update);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            res.status(400).json({ message: "Validation Error", errors: error.issues });
            return;
        }
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

export const getUpdates = async (req: Request, res: Response): Promise<void> => {
    try {
        const updates = await Update.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(updates);
    } catch (error: any) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
