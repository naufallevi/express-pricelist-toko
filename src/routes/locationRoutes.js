import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  getAllLocations,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locationController.js';

const router = Router();
router.use(authenticate);

router.get('/', getAllLocations);
router.post('/', authorize('ADMIN'), createLocation);
router.put('/:id', authorize('ADMIN'), updateLocation);
router.delete('/:id', authorize('ADMIN'), deleteLocation);

export default router;