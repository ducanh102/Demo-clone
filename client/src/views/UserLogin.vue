<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  isLoading.value = true;
  
  if (!email.value || !password.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin';
    isLoading.value = false;
    return;
  }
  
  try {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      // Redirect to previous intended route or home
      const redirectPath = route.query.redirect || '/';
      router.push(redirectPath);
    }
  } catch (err) {
    error.value = 'Đăng nhập thất bại. Vui lòng thử lại.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-form card">
      <h1>Đăng nhập</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email"
            v-model="email"
            class="form-control"
            placeholder="Nhập email của bạn"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            class="form-control"
            placeholder="Nhập mật khẩu"
            required
          >
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đăng nhập' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
        <p class="admin-link">
          <router-link to="/admin/login" class="btn btn-secondary btn-sm">
            Đăng nhập dành cho Admin
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 24px 16px;
}

.auth-form {
  width: 100%;
  max-width: 400px;
  padding: 32px;
}

.auth-form h1 {
  text-align: center;
  margin-bottom: 24px;
  color: var(--secondary);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
  text-align: center;
}

.btn-block {
  width: 100%;
  padding: 12px;
  font-size: 1rem;
}

.auth-links {
  margin-top: 24px;
  text-align: center;
}

.auth-links a {
  color: var(--primary);
  text-decoration: underline;
}

.admin-link {
  margin-top: 16px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 0.9rem;
  text-decoration: none;
}
</style>