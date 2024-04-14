import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrdersByUserId,
  updateOrder,
  deleteOrder,
} from '../controllers/order.controller';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
router.get('/',authMiddleware, getOrders);
router.get('/:id',authMiddleware, getOrdersByUserId);
router.post('/',authMiddleware, createOrder);
router.put('/:id',authMiddleware, updateOrder);
router.delete('/:id',authMiddleware, deleteOrder);

export default router;