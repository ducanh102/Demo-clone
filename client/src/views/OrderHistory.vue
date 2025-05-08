<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from '../utils/axios';
import { useToast } from 'vue-toastification';

const route = useRoute();
const toast = useToast();

const orders = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('/api/orders/user/my-orders');
    orders.value = response.data;
    
    // Highlight new order if redirected from checkout
    const newOrderId = route.query.new;
    if (newOrderId) {
      const orderElement = document.getElementById(`order-${newOrderId}`);
      if (orderElement) {
        orderElement.scrollIntoView({ behavior: 'smooth' });
        orderElement.classList.add('highlight');
      }
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching orders:', error);
    toast.error('Không thể tải lịch sử đơn hàng');
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="order-history-page">
    <div class="container">
      <h1>Lịch sử đơn hàng</h1>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="orders.length === 0" class="no-orders">
        <h2>Chưa có đơn hàng nào</h2>
        <p>Bạn chưa có đơn hàng nào. Hãy đặt món ngay!</p>
        <router-link to="/menu" class="btn btn-primary">Xem thực đơn</router-link>
      </div>
      
      <div v-else class="orders-list">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          :id="`order-${order.id}`"
          class="order-card card"
        >
          <div class="order-header">
            <div class="order-info">
              <div class="order-id">#{{ order.id.slice(0, 8) }}</div>
              <div class="order-date">
                {{ new Date(order.createdAt).toLocaleDateString() }}
              </div>
            </div>
            <div class="order-status" :class="`status-${order.status.toLowerCase()}`">
              {{ order.status }}
            </div>
          </div>
          
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <div class="item-name">
                {{ item.name }}
                <span class="item-quantity">x{{ item.quantity }}</span>
              </div>
              <div class="item-price">{{ item.price.toLocaleString() }}đ</div>
            </div>
          </div>
          
          <div class="order-footer">
            <div class="delivery-info">
              <p><strong>Địa chỉ:</strong> {{ order.address }}</p>
              <p><strong>Số điện thoại:</strong> {{ order.phone }}</p>
              <p><strong>Phương thức thanh toán:</strong> {{ order.paymentMethod }}</p>
            </div>
            
            <div class="order-total">
              <span>Tổng cộng:</span>
              <span class="total-price">{{ order.totalAmount.toLocaleString() }}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-history-page {
  padding: 32px 0;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: var(--secondary);
}

.loading {
  text-align: center;
  padding: 48px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-orders {
  text-align: center;
  padding: 48px 0;
}

.no-orders h2 {
  margin-bottom: 16px;
  color: var(--secondary);
}

.no-orders p {
  margin-bottom: 24px;
  color: var(--gray);
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.order-card {
  padding: 24px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--light-gray);
}

.order-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.order-id {
  font-weight: 600;
  color: var(--secondary);
}

.order-date {
  color: var(--gray);
  font-size: 0.9rem;
}

.order-status {
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-đang.xử.lý {
  background-color: #fff8e1;
  color: #ffa000;
}

.status-đang.giao.hàng {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-đã.giao.hàng {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-đã.hủy {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-items {
  margin-bottom: 16px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--light-gray);
}

.order-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-name {
  font-weight: 500;
}

.item-quantity {
  color: var(--gray);
  margin-left: 8px;
}

.item-price {
  font-weight: 600;
}

.order-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--light-gray);
}

.delivery-info {
  margin-bottom: 16px;
}

.delivery-info p {
  margin: 4px 0;
  font-size: 0.9rem;
}

.order-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.total-price {
  font-size: 1.2rem;
  color: var(--primary);
}

.highlight {
  animation: highlight 2s ease-out;
}

@keyframes highlight {
  0% {
    background-color: var(--primary);
    transform: scale(1.02);
  }
  100% {
    background-color: white;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-info {
    flex-direction: column;
    gap: 4px;
  }
}
</style>