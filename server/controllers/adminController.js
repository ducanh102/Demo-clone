import { getAdminByUsername, verifyPassword } from '../models/adminModel.js';
import { generateToken } from '../middleware/auth.js';

// Admin login
export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }
    
    // Check if admin exists
    const admin = await getAdminByUsername(username);
    if (!admin) {
      return res.status(404).json({ message: 'Tên đăng nhập không tồn tại' });
    }
    
    // Check password
    const isMatch = await verifyPassword(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mật khẩu không chính xác' });
    }
    
    // Generate token
    const token = generateToken(admin, true);
    
    // Remove password from response
    const { password: _, ...adminWithoutPassword } = admin;
    
    res.json({
      message: 'Đăng nhập thành công',
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    // This would typically include more complex logic to calculate stats
    // For simplicity, we're returning mock data here
    res.json({
      totalOrders: 28,
      totalSales: 3250000,
      totalCustomers: 15,
      totalFoodItems: 12,
      recentOrders: [],
      popularItems: []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};