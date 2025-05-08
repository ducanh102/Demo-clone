<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isMobileMenuOpen = ref(false);

// Get current admin name
const adminName = computed(() => {
  return authStore.user ? authStore.user.name || 'Admin' : 'Admin';
});

// Sidebar navigation items
const navItems = [
  { name: 'Dashboard', path: '/admin', icon: '📊' },
  { name: 'Quản lý món ăn', path: '/admin/foods', icon: '🍔' },
  { name: 'Quản lý đơn hàng', path: '/admin/orders', icon: '📦' },
  { name: 'Quản lý đánh giá', path: '/admin/reviews', icon: '⭐' }
];

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

function logout() {
  authStore.logout();
  router.push('/admin/login');
}
</script>

<template>
  <aside :class="['admin-sidebar', { 'mobile-open': isMobileMenuOpen }]">
    <div class="sidebar-header">
      <h2>Quán Ăn Online</h2>
      <button class="mobile-toggle" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    
    <div class="admin-profile">
      <div class="admin-avatar">{{ adminName.charAt(0) }}</div>
      <div class="admin-info">
        <p class="admin-name">{{ adminName }}</p>
        <p class="admin-role">Quản trị viên</p>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <router-link 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.name }}</span>
      </router-link>
    </nav>
    
    <div class="sidebar-footer">
      <button @click="logout" class="btn btn-danger">
        <span>🚪</span> Đăng xuất
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  background-color: var(--secondary);
  color: white;
  width: 250px;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  padding: 16px;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.sidebar-header h2 {
  color: white;
  font-size: 1.25rem;
  margin: 0;
}

.mobile-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-toggle span {
  display: block;
  width: 25px;
  height: 3px;
  margin-bottom: 5px;
  background-color: white;
}

.mobile-toggle span:last-child {
  margin-bottom: 0;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-avatar {
  width: 40px;
  height: 40px;
  background-color: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}

.admin-info {
  overflow: hidden;
}

.admin-name {
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 4px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background-color: var(--primary);
  color: white;
}

.nav-icon {
  width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-footer .btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-toggle {
    display: block;
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    background-color: var(--primary);
    border-radius: 4px;
    padding: 8px;
  }
}
</style>