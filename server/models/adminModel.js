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
  return await bcrypt.compare(plainPassword, hashedPassword);
};