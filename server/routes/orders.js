import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { 
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  createOrder,
  updateOrder
} from '../models/orderModel.js';

const router = express.Router();

// Get all orders (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order by ID (admin and owner)
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await getOrderById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }
    
    // Check if user is admin or order owner
    if (!req.user.isAdmin && order.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền truy cập đơn hàng này' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get orders by user ID
router.get('/user/my-orders', authMiddleware, async (req, res) => {
  try {
    const orders = await getOrdersByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { items, totalAmount, address, phone, paymentMethod } = req.body;
    
    // Validate input
    if (!items || !totalAmount || !address || !phone || !paymentMethod) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Create new order
    const newOrder = await createOrder({
      userId: req.user.id,
      items,
      totalAmount,
      address,
      phone,
      paymentMethod
    });
    
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order (admin only)
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Vui lòng cung cấp trạng thái mới' });
    }
    
    const updatedOrder = await updateOrder(req.params.id, { status });
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;