<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref('');

async function handleLogin() {
  error.value = '';
  isLoading.value = true;
  
  if (!username.value || !password.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin';
    isLoading.value = false;
    return;
  }
  
  try {
    const success = await authStore.loginAdmin(username.value, password.value);
    if (success) {
      router.push('/admin');
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
  <div class="admin-login-container">
    <div class="admin-login-form card">
      <div class="admin-logo">
        <h1>Quán Ăn Online</h1>
        <p>Hệ thống quản lý dành cho Admin</p>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Tên đăng nhập</label>
          <input 
            type="text" 
            id="username"
            v-model="username"
            class="form-control"
            placeholder="Nhập tên đăng nhập"
            required
            autocomplete="username"
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
            autocomplete="current-password"
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
      
      <div class="back-link">
        <a href="/" class="btn btn-secondary">Quay lại trang chủ</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.admin-login-form {
  width: 100%;
  max-width: 400px;
  padding: 32px;
}

.admin-logo {
  text-align: center;
  margin-bottom: 32px;
}

.admin-logo h1 {
  color: var(--primary);
  margin-bottom: 8px;
}

.admin-logo p {
  color: var(--gray);
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

.back-link {
  margin-top: 24px;
  text-align: center;
}
</style>