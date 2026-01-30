import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User, { IUser } from "../models/User";
import { generateToken } from "../utils/generateToken";

export const register = async (req: Request, res: Response) => {
    console.log(req.body);
    
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                theme: user.theme
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Register failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    console.log(req.body);
    
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid credentials" });

        res.json({
            token: generateToken(user.id),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                theme: user.theme
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Login failed" });
    }
};

export const getProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (user) {
            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                theme: user.theme,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const updateProfile = async (req: any, res: Response) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.theme = req.body.theme || user.theme;

            if (req.body.password) {
                user.password = await bcrypt.hash(req.body.password, 10);
            }

            const updatedUser = await user.save();

            res.json({
                id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                theme: updatedUser.theme,
                token: generateToken(updatedUser._id.toString()),
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        if (user && (await bcrypt.compare(currentPassword, user.password))) {
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            res.json({ message: "Password updated successfully" });
        } else {
            res.status(400).json({ message: "Invalid current password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Password update failed" });
    }
};
