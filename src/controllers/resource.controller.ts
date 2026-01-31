import { Request, Response } from 'express';
import Resource from '../models/Resource';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError, HttpStatus } from '../utils/AppError';

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
export const uploadResource = asyncHandler(async (req: any, res: Response) => {
    const { title, description, type, branch, subject, year, fileUrl } = req.body;

    const resource = await Resource.create({
        title,
        description,
        type,
        branch,
        subject,
        year,
        fileUrl,
        uploadedBy: req.user._id,
    });

    sendResponse(res, HttpStatus.CREATED, resource, "Resource uploaded successfully");
});

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;
    const { title, description, type, branch, subject, year, fileUrl } = req.body;

    const resource = await Resource.findById(id);

    if (!resource) {
        throw new AppError("Resource not found", HttpStatus.NOT_FOUND);
    }

    // Check ownership
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized to update this resource", HttpStatus.FORBIDDEN);
    }

    // Update fields
    resource.title = title || resource.title;
    resource.description = description || resource.description;
    resource.type = type || resource.type;
    resource.branch = branch || resource.branch;
    resource.subject = subject || resource.subject;
    resource.year = year || resource.year;
    resource.fileUrl = fileUrl || resource.fileUrl;

    await resource.save();

    sendResponse(res, HttpStatus.OK, resource, "Resource updated successfully");
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private
export const deleteResource = asyncHandler(async (req: any, res: Response) => {
    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
        throw new AppError("Resource not found", HttpStatus.NOT_FOUND);
    }

    // Check ownership
    if (resource.uploadedBy.toString() !== req.user._id.toString()) {
        throw new AppError("Not authorized to delete this resource", HttpStatus.FORBIDDEN);
    }

    await resource.deleteOne();

    sendResponse(res, HttpStatus.OK, null, "Resource deleted successfully");
});

// @desc    Get all resources with filtering
// @route   GET /api/resources
// @access  Public
export const getResources = asyncHandler(async (req: Request, res: Response) => {
    const { type, branch, subject, year } = req.query;

    // Build filter object
    const filter: any = {};
    if (type) filter.type = type;
    if (branch) filter.branch = branch;
    if (subject) filter.subject = subject;
    if (year) filter.year = year;

    // Allow filtering by uploadedBy (e.g., for "My Uploads")
    if (req.query.uploadedBy) {
        filter.uploadedBy = req.query.uploadedBy;
    }

    const resources = await Resource.find(filter)
        .populate('uploadedBy', 'name email')
        .sort({ createdAt: -1 });

    sendResponse(res, HttpStatus.OK, resources, "Resources fetched successfully");
});
