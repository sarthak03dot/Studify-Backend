import express from 'express';
import { createUpdate, getUpdates } from '../controllers/update.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { updateSchema } from '../utils/validationSchemas';

const router = express.Router();

router.post('/', protect, validate(updateSchema), createUpdate); // In real app, restrict to admin
router.get('/', getUpdates);

export default router;
