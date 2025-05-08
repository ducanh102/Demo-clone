import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { 
  getFoods, 
  getFood, 
  getPopular, 
  addFood, 
  editFood, 
  removeFood 
} from '../controllers/foodController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValidType = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isValidMime = allowedTypes.test(file.mimetype);
  
  if (isValidType && isValidMime) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận hình ảnh với định dạng JPEG, JPG, PNG, GIF'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Public routes
router.get('/', getFoods);
router.get('/popular', getPopular);
router.get('/:id', getFood);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), addFood);
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), editFood);
router.delete('/:id', authMiddleware, adminMiddleware, removeFood);

export default router;