import { 
  getAllFoods, 
  getFoodById, 
  getPopularFoods, 
  createFood, 
  updateFood, 
  deleteFood 
} from '../models/foodModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all foods
export const getFoods = async (req, res) => {
  try {
    const foods = await getAllFoods();
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get popular foods
export const getPopular = async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 4;
    const popularFoods = await getPopularFoods(limit);
    res.json(popularFoods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get food by ID
export const getFood = async (req, res) => {
  try {
    const food = await getFoodById(req.params.id);
    
    if (!food) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
    
    res.json(food);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new food
export const addFood = async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    
    // Validate input
    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // Use uploaded image or provided image URL
    let imageUrl = image;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Create new food
    const newFood = await createFood({ 
      name, 
      description, 
      price: parseFloat(price), 
      category, 
      image: imageUrl 
    });
    
    res.status(201).json(newFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update food
export const editFood = async (req, res) => {
  try {
    const { name, description, price, category, popular, image } = req.body;
    
    // Get existing food
    const existingFood = await getFoodById(req.params.id);
    if (!existingFood) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
    
    // Use uploaded image or keep existing image
    let imageUrl = image || existingFood.image;
    if (req.file) {
      // Delete old image file if it's local
      if (existingFood.image?.startsWith('/uploads/')) {
        try {
          const oldImagePath = path.join(__dirname, '..', existingFood.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Update food
    const updatedFood = await updateFood(req.params.id, { 
      name, 
      description, 
      price: price ? parseFloat(price) : existingFood.price, 
      category, 
      popular: popular === undefined ? existingFood.popular : popular === 'true',
      image: imageUrl
    });
    
    res.json(updatedFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete food
export const removeFood = async (req, res) => {
  try {
    // Get existing food
    const existingFood = await getFoodById(req.params.id);
    if (!existingFood) {
      return res.status(404).json({ message: 'Không tìm thấy món ăn' });
    }
    
    // Delete image file if it's local
    if (existingFood.image?.startsWith('/uploads/')) {
      try {
        const imagePath = path.join(__dirname, '..', existingFood.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }
    
    // Delete food
    await deleteFood(req.params.id);
    
    res.json({ message: 'Đã xóa món ăn thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};