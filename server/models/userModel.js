import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const usersFilePath = path.join(__dirname, '../data/users.json');

// Get all users
export const getAllUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
    return [];
  }
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const users = await getAllUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

// Get user by email
export const getUserByEmail = async (email) => {
  try {
    const users = await getAllUsers();
    return users.find(user => user.email === email) || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

// Create new user
export const createUser = async (userData) => {
  try {
    const users = await getAllUsers();
    
    // Check if email already exists
    const existingUser = users.find(user => user.email === userData.email);
    if (existingUser) {
      throw new Error('Email đã tồn tại');
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };
    
    // Add to users array and save
    users.push(newUser);
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    
    // Return user data without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Update user
export const updateUser = async (id, updateData) => {
  try {
    const users = await getAllUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    // If updating password, hash it
    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }
    
    // Update user data
    users[userIndex] = {
      ...users[userIndex],
      ...updateData
    };
    
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
    
    // Return updated user without password
    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};