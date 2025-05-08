<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  address: ''
});

const isLoading = ref(false);
const error = ref('');

async function handleRegister() {
  error.value = '';
  isLoading.value = true;
  
  // Validate form
  if (!form.value.name || !form.value.email || !form.value.password || 
      !form.value.confirmPassword || !form.value.phone || !form.value.address) {
    error.value = 'Vui lòng nhập đầy đủ thông tin';
    isLoading.value = false;
    return;
  }
  
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp';
    isLoading.value = false;
    return;
  }
  
  try {
    const userData = { ...form.value };
    delete userData.confirmPassword;
    
    const success = await authStore.register(userData);
    if (success) {
      router.push('/');
    }
  } catch (err) {
    error.value = 'Đăng ký thất bại. Vui lòng thử lại.';
    console.error(err);
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-form card">
      <h1>Đăng ký</h1>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">Họ tên</label>
          <input 
            type="text" 
            id="name"
            v-model="form.name"
            class="form-control"
            placeholder="Nhập họ tên của bạn"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email"
            v-model="form.email"
            class="form-control"
            placeholder="Nhập email của bạn"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="phone">Số điện thoại</label>
          <input 
            type="tel" 
            id="phone"
            v-model="form.phone"
            class="form-control"
            placeholder="Nhập số điện thoại"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="address">Địa chỉ</label>
          <textarea 
            id="address"
            v-model="form.address"
            class="form-control"
            placeholder="Nhập địa chỉ giao hàng"
            rows="2"
            required
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input 
            type="password" 
            id="password"
            v-model="form.password"
            class="form-control"
            placeholder="Nhập mật khẩu"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="confirmPassword">Xác nhận mật khẩu</label>
          <input 
            type="password" 
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="form-control"
            placeholder="Nhập lại mật khẩu"
            required
          >
        </div>
        
        <button 
          type="submit" 
          class="btn btn-primary btn-block"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
        </button>
      </form>
      
      <div class="auth-links">
        <p>Đã có tài khoản? <router-link to="/login">Đăng nhập ngay</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px 16px;
}

.auth-form {
  width: 100%;
  max-width: 500px;
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
</style>