import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from '../utils/axios';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast();
  const user = ref(null);
  const token = ref(null);
  const isAdmin = ref(false);
  
  const isAuthenticated = computed(() => !!token.value);
  
  // Initialize auth state from localStorage
  function initializeAuth() {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedIsAdmin = localStorage.getItem('isAdmin');
    
    if (savedToken && savedUser) {
      token.value = savedToken;
      user.value = JSON.parse(savedUser);
      isAdmin.value = savedIsAdmin === 'true';
    }
  }
  
  // Login user
  async function login(email, password) {
    try {
      const response = await axios.post('/api/users/login', { email, password });
      token.value = response.data.token;
      user.value = response.data.user;
      isAdmin.value = false;
      
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('isAdmin', 'false');
      
      toast.success("Login successful!");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return false;
    }
  }
  
  // Login admin
  async function loginAdmin(username, password) {
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      token.value = response.data.token;
      user.value = response.data.admin;
      isAdmin.value = true;
      
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('isAdmin', 'true');
      
      toast.success("Admin login successful!");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Admin login failed";
      toast.error(message);
      return false;
    }
  }
  
  // Register user
  async function register(userData) {
    try {
      const response = await axios.post('/api/users/register', userData);
      token.value = response.data.token;
      user.value = response.data.user;
      isAdmin.value = false;
      
      localStorage.setItem('token', token.value);
      localStorage.setItem('user', JSON.stringify(user.value));
      localStorage.setItem('isAdmin', 'false');
      
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return false;
    }
  }
  
  // Logout
  function logout() {
    token.value = null;
    user.value = null;
    isAdmin.value = false;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    
    toast.info("You have been logged out");
  }
  
  return {
    user,
    token,
    isAdmin,
    isAuthenticated,
    initializeAuth,
    login,
    loginAdmin,
    register,
    logout
  };
});