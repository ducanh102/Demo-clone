import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Customer Pages
import Home from '../views/Home.vue';
import Menu from '../views/Menu.vue';
import FoodDetails from '../views/FoodDetails.vue';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import UserLogin from '../views/UserLogin.vue';
import UserRegister from '../views/UserRegister.vue';
import UserProfile from '../views/UserProfile.vue';
import OrderHistory from '../views/OrderHistory.vue';

// Admin Pages
import AdminLogin from '../views/admin/AdminLogin.vue';
import AdminDashboard from '../views/admin/AdminDashboard.vue';
import ManageFoods from '../views/admin/ManageFoods.vue';
import ManageOrders from '../views/admin/ManageOrders.vue';
import ManageReviews from '../views/admin/ManageReviews.vue';

const routes = [
  // Customer Routes
  { path: '/', component: Home, name: 'home' },
  { path: '/menu', component: Menu, name: 'menu' },
  { path: '/food/:id', component: FoodDetails, name: 'food-details' },
  { path: '/cart', component: Cart, name: 'cart' },
  { path: '/checkout', component: Checkout, name: 'checkout', meta: { requiresAuth: true } },
  { path: '/login', component: UserLogin, name: 'login', meta: { guestOnly: true } },
  { path: '/register', component: UserRegister, name: 'register', meta: { guestOnly: true } },
  { path: '/profile', component: UserProfile, name: 'profile', meta: { requiresAuth: true } },
  { path: '/orders', component: OrderHistory, name: 'orders', meta: { requiresAuth: true } },
  
  // Admin Routes
  { path: '/admin/login', component: AdminLogin, name: 'admin-login', meta: { hideNavbar: true, hideFooter: true, adminGuestOnly: true } },
  { 
    path: '/admin', 
    component: AdminDashboard, 
    name: 'admin-dashboard',
    meta: { requiresAdmin: true, hideNavbar: true, hideFooter: true }
  },
  { 
    path: '/admin/foods', 
    component: ManageFoods, 
    name: 'admin-foods',
    meta: { requiresAdmin: true, hideNavbar: true, hideFooter: true }
  },
  { 
    path: '/admin/orders', 
    component: ManageOrders, 
    name: 'admin-orders',
    meta: { requiresAdmin: true, hideNavbar: true, hideFooter: true }
  },
  { 
    path: '/admin/reviews', 
    component: ManageReviews, 
    name: 'admin-reviews',
    meta: { requiresAdmin: true, hideNavbar: true, hideFooter: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // Check for authentication requirements
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } 
  // Check for admin requirements
  else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next({ name: 'admin-login' });
  } 
  // Redirect authenticated users away from login/register
  else if (to.meta.guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' });
  }
  // Redirect authenticated admins away from admin login
  else if (to.meta.adminGuestOnly && authStore.isAdmin) {
    next({ name: 'admin-dashboard' });
  }
  else {
    next();
  }
});

export default router;