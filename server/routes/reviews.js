import express from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';
import { 
  getAllReviews,
  getReviewById,
  getReviewsByFoodId,
  getReviewsByUserId,
  createReview,
  updateReview,
  deleteReview
} from '../models/reviewModel.js';
import { getFoodById, updateFood } from '../models/foodModel.js';

const router = express.Router();

// Get all reviews (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const reviews = await getAllReviews();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews by food ID
router.get('/food/:foodId', async (req, res) => {
  try {
    const reviews = await getReviewsByFoodId(req.params.foodId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews by user ID
router.get('/user', authMiddleware, async (req, res) => {
  try {
    const reviews = await getReviewsByUserId(req.user.id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new review
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { foodId, rating, comment } = req.body;
    
    // Validate input
    if (!foodId || !rating || !comment) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Check if food exists
    const food = await getFoodById(foodId);
    if (!food) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
    
    // Create new review
    const newReview = await createReview({
      userId: req.user.id,
      foodId,
      rating: parseInt(rating),
      comment,
      userName: req.user.name
    });
    
    // Update food rating
    const allReviews = await getReviewsByFoodId(foodId);
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    await updateFood(foodId, { rating: averageRating.toFixed(1) });
    
    res.status(201).json(newReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update review (admin reply or user edit)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Check if user is admin or review owner
    if (!req.user.isAdmin && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền chỉnh sửa đánh giá này' });
    }
    
    // Update review
    let updateData = {};
    
    if (req.user.isAdmin) {
      // Admin can add a reply
      updateData = { adminReply: req.body.adminReply };
    } else {
      // User can edit their own review
      if (!req.body.rating || !req.body.comment) {
        return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
      }
      
      updateData = {
        rating: parseInt(req.body.rating),
        comment: req.body.comment
      };
      
      // Update food rating
      const allReviews = await getReviewsByFoodId(review.foodId);
      // Update the current review in the array for calculation
      const updatedReviews = allReviews.map(r => 
        r.id === review.id ? { ...r, rating: parseInt(req.body.rating) } : r
      );
      
      const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / updatedReviews.length;
      
      await updateFood(review.foodId, { rating: averageRating.toFixed(1) });
    }
    
    const updatedReview = await updateReview(req.params.id, updateData);
    
    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete review (admin or owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const review = await getReviewById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Check if user is admin or review owner
    if (!req.user.isAdmin && review.userId !== req.user.id) {
      return res.status(403).json({ message: 'Không có quyền xóa đánh giá này' });
    }
    
    await deleteReview(req.params.id);
    
    // Update food rating
    const allReviews = await getReviewsByFoodId(review.foodId);
    
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = totalRating / allReviews.length;
      await updateFood(review.foodId, { rating: averageRating.toFixed(1) });
    } else {
      // No reviews left, reset rating to 0
      await updateFood(review.foodId, { rating: 0 });
    }
    
    res.json({ message: 'Đã xóa đánh giá thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;