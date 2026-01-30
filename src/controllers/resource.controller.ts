import { Response } from 'express';
import Resource from '../models/Resource';
import { z } from 'zod';
import { AuthRequest } from '../middlewares/auth.middleware';

// Validation schema for resource upload
const resourceSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(5),
    type: z.enum(['note', 'syllabus', 'paper']),
    branch: z.string(),
    subject: z.string(),
    year: z.number().min(1).max(4),
    fileUrl: z.string().url(),
});

// @desc    Upload a new resource
// @route   POST /api/resources
// @access  Private
export const uploadResource = async (req: AuthRequest, res: Response): Promise<void> => {
    console.log(req.body);

    try {
        // Validate request body
        const validationResult = resourceSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.issues
            });
            return;
        }

        const { title, description, type, branch, subject, year, fileUrl } = validationResult.data;

        // Check if user exists (should be guaranteed by auth middleware)
        if (!req.user) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

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

        res.status(201).json(resource);
    } catch (error) {
        console.error('Error uploading resource:', error);
        res.status(500).json({ message: 'Server error while uploading resource' });
    }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private
export const updateResource = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Validate request body
        const validationResult = resourceSchema.safeParse(req.body);

        if (!validationResult.success) {
            res.status(400).json({
                message: 'Validation failed',
                errors: validationResult.error.issues
            });
            return;
        }

        const { title, description, type, branch, subject, year, fileUrl } = validationResult.data;

        // Check if user exists
        if (!req.user) {
            res.status(401).json({ message: 'User not authorized' });
            return;
        }

        const resource = await Resource.findById(id);

        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }

        // Check ownership
        if (resource.uploadedBy.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: 'Not authorized to update this resource' });
            return;
        }

        // Update fields
        resource.title = title;
        resource.description = description;
        resource.type = type;
        resource.branch = branch;
        resource.subject = subject;
        resource.year = year;
        resource.fileUrl = fileUrl;

        await resource.save();

        res.status(200).json(resource);
    } catch (error) {
        console.error('Error updating resource:', error);
        res.status(500).json({ message: 'Server error while updating resource' });
    }
};

// @desc    Get all resources with filtering
// @route   GET /api/resources
// @access  Public (or Private depending on requirements, usually public for reading)
export const getResources = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
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
            .sort({ createdAt: -1 }); // Newest first

        res.status(200).json(resources);
    } catch (error) {
        console.error('Error fetching resources:', error);
        res.status(500).json({ message: 'Server error while fetching resources' });
    }
};
