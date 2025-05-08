<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import axios from '../utils/axios';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

// Form data
const form = ref({
  name: '',
  phone: '',
  address: '',
  note: '',
  paymentMethod: 'cash' // Default to cash on delivery
});

// Loading state
const isLoading = ref(false);

// Computed properties
const cartItems = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);
const isEmpty = computed(() => cartItems.value.length === 0);

// Fill form data from user profile
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user) {
    form.value.name = authStore.user.name || '';
    form.value.phone = authStore.user.phone || '';
    form.value.address = authStore.user.address || '';
  }
});

// Place order
async function placeOrder() {
  if (isEmpty.value) {
    toast.error('Giỏ hàng trống. Không thể đặt hàng.');
    return;
  }
  
  if (!form.value.name || !form.value.phone || !form.value.address) {
    toast.error('Vui lòng nhập đầy đủ thông tin giao hàng.');
    return;
  }
  
  isLoading.value = true;
  
  try {
    // Prepare order data
    const orderData = {
      items: cartItems.value,
      totalAmount: totalPrice.value,
      address: form.value.address,
      phone: form.value.phone,
      note: form.value.note,
      paymentMethod: form.value.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'
    };
    
    // Submit order
    const response = await axios.post('/api/orders', orderData);
    
    // Clear cart
    cartStore.clearCart();
    
    // Show success message
    toast.success('Đặt hàng thành công!');
    
    // Redirect to order history
    router.push(`/orders?new=${response.data.id}`);
  } catch (error) {
    console.error('Error placing order:', error);
    toast.error('Đặt hàng thất bại. Vui lòng thử lại.');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="checkout-page">
    <div class="container">
      <h1>Thanh toán</h1>
      
      <div v-if="isEmpty" class="empty-checkout">
        <h2>Giỏ hàng trống</h2>
        <p>Thêm món ăn vào giỏ hàng để tiến hành đặt hàng.</p>
        <router-link to="/menu" class="btn btn-primary">Xem thực đơn</router-link>
      </div>
      
      <div v-else class="checkout-content">
        <div class="checkout-form card">
          <h2>Thông tin giao hàng</h2>
          
          <div class="form-group">
            <label for="name">Họ tên</label>
            <input 
              type="text" 
              id="name"
              v-model="form.name"
              class="form-control"
              placeholder="Nhập họ tên người nhận"
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
              placeholder="Nhập số điện thoại liên hệ"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="address">Địa chỉ giao hàng</label>
            <textarea 
              id="address"
              v-model="form.address"
              class="form-control"
              placeholder="Nhập địa chỉ giao hàng chi tiết"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="form-group">
            <label for="note">Ghi chú (tùy chọn)</label>
            <textarea 
              id="note"
              v-model="form.note"
              class="form-control"
              placeholder="Ghi chú đặc biệt về đơn hàng (nếu có)"
              rows="2"
            ></textarea>
          </div>
          
          <h2>Phương thức thanh toán</h2>
          
          <div class="payment-options">
            <div class="payment-option">
              <input 
                type="radio" 
                id="cash" 
                value="cash"
                v-model="form.paymentMethod"
                checked
              >
              <label for="cash">Thanh toán khi nhận hàng (COD)</label>
            </div>
          </div>
        </div>
        
        <div class="order-summary card">
          <h2>Tổng đơn hàng</h2>
          
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.id" class="order-item">
              <div class="item-name">
                {{ item.name }} <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <div class="item-price">{{ (item.price * item.quantity).toLocaleString() }}đ</div>
            </div>
          </div>
          
          <div class="order-total">
            <div class="total-row">
              <span>Tổng số lượng:</span>
              <span>{{ totalItems }} món</span>
            </div>
            <div class="total-row">
              <span>Tổng tiền:</span>
              <span class="final-price">{{ totalPrice.toLocaleString() }}đ</span>
            </div>
          </div>
          
          <button 
            class="btn btn-primary place-order-btn"
            @click="placeOrder"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Đang xử lý...' : 'Đặt hàng ngay' }}
          </button>
          
          <router-link to="/cart" class="back-to-cart">
            « Quay lại giỏ hàng
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-page {
  padding: 32px 0;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: var(--secondary);
}

.empty-checkout {
  text-align: center;
  padding: 64px 0;
  max-width: 500px;
  margin: 0 auto;
}

.empty-checkout h2 {
  margin-bottom: 16px;
  color: var(--secondary);
}

.empty-checkout p {
  margin-bottom: 24px;
  color: var(--gray);
}

.checkout-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.checkout-form, .order-summary {
  padding: 24px;
}

.checkout-form h2, .order-summary h2 {
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

.payment-options {
  margin-bottom: 24px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.payment-option input[type="radio"] {
  margin: 0;
}

.order-items {
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--light-gray);
}

.order-item:last-child {
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  color: var(--gray);
  margin-left: 4px;
}

.item-price {
  font-weight: 600;
}

.order-total {
  margin-bottom: 24px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.total-row:last-child {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--light-gray);
}

.final-price {
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--primary);
}

.place-order-btn {
  width: 100%;
  padding: 12px;
  font-size: 1.1rem;
  margin-bottom: 16px;
}

.back-to-cart {
  display: block;
  text-align: center;
  color: var(--secondary);
}

@media (min-width: 1024px) {
  .checkout-content {
    grid-template-columns: 2fr 1fr;
  }
}
</style>