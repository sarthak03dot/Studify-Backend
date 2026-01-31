import { Request, Response } from 'express';
import Update from '../models/Update';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { HttpStatus } from '../utils/AppError';

export const createUpdate = asyncHandler(async (req: Request, res: Response) => {
    const update = new Update(req.body);
    await update.save();

    // Real-time broadcast
    // Use require to avoid circular dependency
    const { io } = require('../server');
    if (io) {
        io.emit('new_update', update);
    }

    sendResponse(res, HttpStatus.CREATED, update, "Update created successfully");
});

export const getUpdates = asyncHandler(async (req: Request, res: Response) => {
    const updates = await Update.find().sort({ createdAt: -1 }).limit(10);
    sendResponse(res, HttpStatus.OK, updates, "Updates fetched successfully");
});
