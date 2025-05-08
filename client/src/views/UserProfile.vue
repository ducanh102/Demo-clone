<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import axios from '../utils/axios';

const authStore = useAuthStore();
const toast = useToast();

const form = ref({
  name: '',
  phone: '',
  address: ''
});

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const isLoading = ref(false);
const isChangingPassword = ref(false);

onMounted(() => {
  if (authStore.user) {
    form.value.name = authStore.user.name || '';
    form.value.phone = authStore.user.phone || '';
    form.value.address = authStore.user.address || '';
  }
});

async function updateProfile() {
  if (!form.value.name || !form.value.phone || !form.value.address) {
    toast.error('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.put('/api/users/profile', form.value);
    
    // Update local user data
    authStore.user = response.data.user;
    
    toast.success('Cập nhật thông tin thành công');
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Cập nhật thông tin thất bại');
  } finally {
    isLoading.value = false;
  }
}

async function changePassword() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    toast.error('Vui lòng nhập đầy đủ thông tin');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    toast.error('Mật khẩu mới không khớp');
    return;
  }

  isChangingPassword.value = true;

  try {
    await axios.put('/api/users/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });
    
    // Reset password fields
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    
    toast.success('Đổi mật khẩu thành công');
  } catch (error) {
    console.error('Error changing password:', error);
    toast.error('Đổi mật khẩu thất bại');
  } finally {
    isChangingPassword.value = false;
  }
}
</script>

<template>
  <div class="profile-page">
    <div class="container">
      <h1>Thông tin tài khoản</h1>
      
      <div class="profile-content">
        <!-- Profile Information -->
        <div class="profile-section card">
          <h2>Thông tin cá nhân</h2>
          
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
              rows="3"
              required
            ></textarea>
          </div>
          
          <button 
            @click="updateProfile" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
          </button>
        </div>
        
        <!-- Change Password -->
        <div class="profile-section card">
          <h2>Đổi mật khẩu</h2>
          
          <div class="form-group">
            <label for="currentPassword">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              id="currentPassword"
              v-model="currentPassword"
              class="form-control"
              placeholder="Nhập mật khẩu hiện tại"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="newPassword">Mật khẩu mới</label>
            <input 
              type="password" 
              id="newPassword"
              v-model="newPassword"
              class="form-control"
              placeholder="Nhập mật khẩu mới"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu mới</label>
            <input 
              type="password" 
              id="confirmPassword"
              v-model="confirmPassword"
              class="form-control"
              placeholder="Nhập lại mật khẩu mới"
              required
            >
          </div>
          
          <button 
            @click="changePassword" 
            class="btn btn-primary"
            :disabled="isChangingPassword"
          >
            {{ isChangingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  padding: 32px 0;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: var(--secondary);
}

.profile-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.profile-section {
  padding: 24px;
}

.profile-section h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--secondary);
  font-size: 1.25rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.btn {
  width: 100%;
  margin-top: 8px;
}

@media (min-width: 768px) {
  .profile-content {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>