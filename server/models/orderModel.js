import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ordersFilePath = path.join(__dirname, '../data/orders.json');

// Get all orders
export const getAllOrders = async () => {
  try {
    const data = await fs.readFile(ordersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading orders file:', error);
    return [];
  }
};

// Get order by ID
export const getOrderById = async (id) => {
  try {
    const orders = await getAllOrders();
    return orders.find(order => order.id === id) || null;
  } catch (error) {
    console.error('Error getting order by ID:', error);
    return null;
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (userId) => {
  try {
    const orders = await getAllOrders();
    return orders.filter(order => order.userId === userId);
  } catch (error) {
    console.error('Error getting orders by user ID:', error);
    return [];
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const orders = await getAllOrders();
    
    // Create new order
    const newOrder = {
      id: Date.now().toString(),
      ...orderData,
      status: 'Đang xử lý',
      createdAt: new Date().toISOString()
    };
    
    // Add to orders array and save
    orders.push(newOrder);
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Update order
export const updateOrder = async (id, updateData) => {
  try {
    const orders = await getAllOrders();
    const orderIndex = orders.findIndex(order => order.id === id);
    
    if (orderIndex === -1) {
      throw new Error('Không tìm thấy đơn hàng');
    }
    
    // Update order data
    orders[orderIndex] = {
      ...orders[orderIndex],
      ...updateData
    };
    
    await fs.writeFile(ordersFilePath, JSON.stringify(orders, null, 2));
    
    return orders[orderIndex];
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};