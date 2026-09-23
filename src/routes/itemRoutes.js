import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import {
  getAllItems,
  createItem,
  updateItem,
  updateItemPrice,
  deleteItem,
} from '../controllers/itemController.js';

const router = Router();
router.use(authenticate);

router.get('/', getAllItems);
router.post('/', authorize('ADMIN'), createItem);
router.put('/:id', authorize('ADMIN'), updateItem);
router.patch('/:id/price', authorize('ADMIN'), updateItemPrice);
router.delete('/:id', authorize('ADMIN'), deleteItem);

export default router;