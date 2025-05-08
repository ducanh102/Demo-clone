<script setup>
import { ref, onMounted } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import axios from '../../utils/axios';

const stats = ref({
  totalOrders: 0,
  totalSales: 0,
  totalCustomers: 0,
  totalFoodItems: 0,
  recentOrders: [],
  popularItems: []
});

const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('/api/admin/dashboard');
    stats.value = response.data;
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <div class="admin-header">
        <h1>Dashboard</h1>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <div v-else>
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #4caf50;">
              <span>📦</span>
            </div>
            <div class="stat-content">
              <h3>Tổng đơn hàng</h3>
              <p class="stat-value">{{ stats.totalOrders }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #2196f3;">
              <span>💰</span>
            </div>
            <div class="stat-content">
              <h3>Doanh thu</h3>
              <p class="stat-value">{{ stats.totalSales.toLocaleString() }}đ</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #ff9800;">
              <span>👤</span>
            </div>
            <div class="stat-content">
              <h3>Khách hàng</h3>
              <p class="stat-value">{{ stats.totalCustomers }}</p>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #e91e63;">
              <span>🍔</span>
            </div>
            <div class="stat-content">
              <h3>Món ăn</h3>
              <p class="stat-value">{{ stats.totalFoodItems }}</p>
            </div>
          </div>
        </div>
        
        <!-- Recent Orders -->
        <div class="recent-orders card">
          <h2>Đơn hàng gần đây</h2>
          
          <div v-if="stats.recentOrders.length === 0" class="no-orders">
            <p>Chưa có đơn hàng nào.</p>
          </div>
          
          <div v-else class="orders-table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="order in stats.recentOrders" :key="order.id">
                  <td>#{{ order.id.slice(0, 8) }}</td>
                  <td>{{ order.userName }}</td>
                  <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
                  <td>{{ order.totalAmount.toLocaleString() }}đ</td>
                  <td>
                    <span class="status-badge" :class="`status-${order.status.toLowerCase()}`">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <router-link :to="`/admin/orders?id=${order.id}`" class="btn-view">
                      Xem
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="view-all-link">
            <router-link to="/admin/orders">Xem tất cả đơn hàng »</router-link>
          </div>
        </div>
        
        <!-- Popular Items -->
        <div class="popular-items card">
          <h2>Món ăn phổ biến</h2>
          
          <div v-if="stats.popularItems.length === 0" class="no-items">
            <p>Chưa có dữ liệu về món ăn phổ biến.</p>
          </div>
          
          <div v-else class="popular-items-grid">
            <div v-for="item in stats.popularItems" :key="item.id" class="popular-item">
              <div class="popular-item-image">
                <img :src="item.image" :alt="item.name" />
              </div>
              <div class="popular-item-info">
                <h3>{{ item.name }}</h3>
                <p class="popular-item-price">{{ item.price.toLocaleString() }}đ</p>
                <div class="popular-item-stats">
                  <span>
                    <span class="stats-icon">📊</span> Đã bán: {{ item.soldCount }}
                  </span>
                  <span>
                    <span class="stats-icon">⭐</span> {{ item.rating }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="view-all-link">
            <router-link to="/admin/foods">Quản lý tất cả món ăn »</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.admin-content {
  flex: 1;
  padding: 24px;
  margin-left: 250px;
  background-color: #f8f9fa;
}

.admin-header {
  margin-bottom: 24px;
}

.admin-header h1 {
  margin: 0;
  color: var(--secondary);
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--primary);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-content h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--gray);
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 4px 0 0;
  color: var(--dark);
}

/* Recent Orders */
.recent-orders, .popular-items {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.recent-orders h2, .popular-items h2 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--secondary);
  font-size: 1.25rem;
}

.orders-table-container {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--light-gray);
}

.orders-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: var(--secondary);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-đang {
  background-color: #fff8e1;
  color: #ffa000;
}

.status-đã {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-hủy {
  background-color: #ffebee;
  color: #d32f2f;
}

.btn-view {
  background-color: var(--secondary);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.no-orders, .no-items {
  text-align: center;
  padding: 24px;
  color: var(--gray);
}

/* Popular Items */
.popular-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.popular-item {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.popular-item-image {
  height: 120px;
  overflow: hidden;
}

.popular-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.popular-item-info {
  padding: 12px;
}

.popular-item-info h3 {
  margin: 0 0 8px;
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.popular-item-price {
  color: var(--primary);
  font-weight: 600;
  margin-bottom: 8px;
}

.popular-item-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--gray);
}

.stats-icon {
  margin-right: 4px;
}

.view-all-link {
  text-align: right;
  margin-top: 16px;
}

.view-all-link a {
  color: var(--primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .admin-content {
    margin-left: 0;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .popular-items-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>