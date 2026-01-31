import express from 'express';
import { uploadResource, getResources, updateResource } from '../controllers/resource.controller';
import { protect } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { resourceSchema } from '../utils/validationSchemas';

const router = express.Router();

router.route('/')
    .post(protect, validate(resourceSchema), uploadResource)
    .get(getResources);

router.route('/:id')
    .put(protect, validate(resourceSchema), updateResource);

export default router;
