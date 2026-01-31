import { z } from "zod";

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
    }),
});

export const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        theme: z.enum(["light", "dark"]).optional(),
    }),
});

export const changePasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
    }),
});

export const createQuestionSchema = z.object({
    body: z.object({
        title: z.string().min(5, "Title must be at least 5 characters"),
        description: z.string().min(10, "Description must be at least 10 characters"),
        difficulty: z.enum(["easy", "medium", "hard"]),
        tags: z.array(z.string()).min(1, "At least one tag is required"),
    }),
});

export const resourceSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        description: z.string().min(5, "Description must be at least 5 characters"),
        type: z.enum(['note', 'syllabus', 'paper']),
        branch: z.string().min(1, "Branch is required"),
        subject: z.string().min(1, "Subject is required"),
        year: z.number().min(1).max(4),
        fileUrl: z.string().url("Invalid file URL"),
    }),
});

export const updateSchema = z.object({
    body: z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        message: z.string().min(10, "Message must be at least 10 characters"),
        type: z.enum(['info', 'alert', 'new_content']).optional(),
    }),
});
