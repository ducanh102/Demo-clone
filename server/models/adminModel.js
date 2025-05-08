import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const adminsFilePath = path.join(__dirname, '../data/admins.json');

// Get all admins
export const getAllAdmins = async () => {
  try {
    const data = await fs.readFile(adminsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading admins file:', error);
    return [];
  }
};

// Get admin by ID
export const getAdminById = async (id) => {
  try {
    const admins = await getAllAdmins();
    return admins.find(admin => admin.id === id) || null;
  } catch (error) {
    console.error('Error getting admin by ID:', error);
    return null;
  }
};

// Get admin by username
export const getAdminByUsername = async (username) => {
  try {
    const admins = await getAllAdmins();
    return admins.find(admin => admin.username === username) || null;
  } catch (error) {
    console.error('Error getting admin by username:', error);
    return null;
  }
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
};

// Create new admin (for testing)
export const createAdmin = async (adminData) => {
  try {
    const admins = await getAllAdmins();
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    
    // Create new admin
    const newAdmin = {
      id: Date.now().toString(),
      ...adminData,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Add to admins array and save
    admins.push(newAdmin);
    await fs.writeFile(adminsFilePath, JSON.stringify(admins, null, 2));
    
    // Return admin without password
    const { password, ...adminWithoutPassword } = newAdmin;
    return adminWithoutPassword;
  } catch (error) {
    console.error('Error creating admin:', error);
    throw error;
  }
};