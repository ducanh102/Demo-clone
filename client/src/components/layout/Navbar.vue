<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

const mobileMenuOpen = ref(false);

const isLoggedIn = computed(() => authStore.isAuthenticated);
const cartItemCount = computed(() => cartStore.totalItems);

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value;
}

function logout() {
  authStore.logout();
  router.push('/');
}
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <div class="navbar-content">
        <div class="logo">
          <router-link to="/">
            <h1>Quán Ăn Online</h1>
          </router-link>
        </div>

        <!-- Desktop Menu -->
        <div class="nav-links desktop-menu">
          <router-link to="/" class="nav-link">Trang chủ</router-link>
          <router-link to="/menu" class="nav-link">Thực đơn</router-link>
          <div v-if="isLoggedIn" class="dropdown">
            <button class="nav-link dropdown-toggle">Tài khoản</button>
            <div class="dropdown-menu">
              <router-link to="/profile" class="dropdown-item">Hồ sơ</router-link>
              <router-link to="/orders" class="dropdown-item">Lịch sử đơn hàng</router-link>
              <a href="#" @click.prevent="logout" class="dropdown-item">Đăng xuất</a>
            </div>
          </div>
          <template v-else>
            <router-link to="/login" class="nav-link">Đăng nhập</router-link>
            <router-link to="/register" class="nav-link">Đăng ký</router-link>
          </template>
          <router-link to="/cart" class="cart-icon nav-link">
            Giỏ hàng
            <span v-if="cartItemCount > 0" class="cart-badge">{{ cartItemCount }}</span>
          </router-link>
        </div>
        
        <!-- Mobile Menu Toggle Button -->
        <div class="mobile-menu-toggle" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="mobileMenuOpen = false">Trang chủ</router-link>
        <router-link to="/menu" class="nav-link" @click="mobileMenuOpen = false">Thực đơn</router-link>
        <template v-if="isLoggedIn">
          <router-link to="/profile" class="nav-link" @click="mobileMenuOpen = false">Hồ sơ</router-link>
          <router-link to="/orders" class="nav-link" @click="mobileMenuOpen = false">Lịch sử đơn hàng</router-link>
          <a href="#" @click.prevent="logout" class="nav-link">Đăng xuất</a>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link" @click="mobileMenuOpen = false">Đăng nhập</router-link>
          <router-link to="/register" class="nav-link" @click="mobileMenuOpen = false">Đăng ký</router-link>
        </template>
        <router-link to="/cart" class="nav-link" @click="mobileMenuOpen = false">
          Giỏ hàng
          <span v-if="cartItemCount > 0" class="cart-badge-mobile">{{ cartItemCount }}</span>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.logo h1 {
  color: var(--primary);
  font-size: 1.5rem;
  margin: 0;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: var(--dark);
  font-weight: 500;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover {
  color: var(--primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -4px;
  left: 0;
  background-color: var(--primary);
  transition: width 0.3s;
}

.nav-link:hover::after,
.router-link-active::after {
  width: 100%;
}

.router-link-active {
  color: var(--primary);
}

.cart-icon {
  position: relative;
}

.cart-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: var(--accent);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.cart-badge-mobile {
  background-color: var(--accent);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 8px;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-toggle::after {
  content: '▼';
  font-size: 0.6rem;
  margin-left: 4px;
}

.dropdown:hover .dropdown-menu {
  display: block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  border-radius: 4px;
  display: none;
  z-index: 10;
}

.dropdown-item {
  display: block;
  padding: 8px 16px;
  transition: background-color 0.3s;
}

.dropdown-item:hover {
  background-color: var(--light-gray);
  color: var(--primary);
}

/* Mobile Menu */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
}

.mobile-menu-toggle span {
  width: 25px;
  height: 3px;
  background-color: var(--dark);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .desktop-menu {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .mobile-menu {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 0;
    height: 0;
    overflow: hidden;
    transition: height 0.3s ease, padding 0.3s ease;
  }

  .mobile-menu.active {
    height: auto;
    border-top: 1px solid var(--light-gray);
  }

  .mobile-menu .nav-link {
    padding: 8px 0;
  }
}
</style>