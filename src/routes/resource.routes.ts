import express from 'express';
import { uploadResource, getResources, updateResource } from '../controllers/resource.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

router.route('/')
    .post(protect, uploadResource)
    .get(getResources);

router.route('/:id')
    .put(protect, updateResource);

export default router;
