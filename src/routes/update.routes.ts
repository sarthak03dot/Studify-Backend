import express from 'express';
import { createUpdate, getUpdates } from '../controllers/update.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/', protect, createUpdate); // In real app, restrict to admin
router.get('/', getUpdates);

export default router;
