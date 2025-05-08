<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import axios from '../../utils/axios';
import { useToast } from 'vue-toastification';

const route = useRoute();
const toast = useToast();

const orders = ref([]);
const isLoading = ref(true);
const selectedOrder = ref(null);
const showModal = ref(false);

// Filters
const statusFilter = ref('all');
const searchQuery = ref('');
const sortOrder = ref('newest');

// Filtered and sorted orders
const filteredOrders = computed(() => {
  let result = [...orders.value];
  
  // Apply status filter
  if (statusFilter.value !== 'all') {
    result = result.filter(order => order.status === statusFilter.value);
  }
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(order => 
      order.id.toLowerCase().includes(query) || 
      order.address.toLowerCase().includes(query) ||
      order.phone.includes(query)
    );
  }
  
  // Apply sorting
  if (sortOrder.value === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortOrder.value === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortOrder.value === 'highest') {
    result.sort((a, b) => b.totalAmount - a.totalAmount);
  } else if (sortOrder.value === 'lowest') {
    result.sort((a, b) => a.totalAmount - b.totalAmount);
  }
  
  return result;
});

// Order statuses for dropdown
const orderStatuses = [
  'Đang xử lý',
  'Đang giao hàng',
  'Đã giao hàng',
  'Đã hủy'
];

// Load orders data
onMounted(async () => {
  try {
    const response = await axios.get('/api/orders');
    orders.value = response.data;
    
    // Check if there's an order ID in the URL
    const orderId = route.query.id;
    if (orderId) {
      const order = orders.value.find(o => o.id === orderId);
      if (order) {
        viewOrderDetails(order);
      }
    }
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading orders:', error);
    toast.error('Không thể tải danh sách đơn hàng');
    isLoading.value = false;
  }
});

// View order details
function viewOrderDetails(order) {
  selectedOrder.value = order;
  showModal.value = true;
}

// Close modal
function closeModal() {
  showModal.value = false;
}

// Update order status
async function updateStatus(newStatus) {
  try {
    await axios.put(`/api/orders/${selectedOrder.value.id}`, {
      status: newStatus
    });
    
    // Update local state
    selectedOrder.value.status = newStatus;
    
    // Update in orders list
    const orderIndex = orders.value.findIndex(o => o.id === selectedOrder.value.id);
    if (orderIndex !== -1) {
      orders.value[orderIndex].status = newStatus;
    }
    
    toast.success('Cập nhật trạng thái thành công');
  } catch (error) {
    console.error('Error updating order status:', error);
    toast.error('Cập nhật trạng thái thất bại');
  }
}

// Get status class
function getStatusClass(status) {
  if (status === 'Đang xử lý') return 'status-processing';
  if (status === 'Đang giao hàng') return 'status-shipping';
  if (status === 'Đã giao hàng') return 'status-delivered';
  if (status === 'Đã hủy') return 'status-canceled';
  return '';
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <div class="admin-header">
        <h1>Quản lý đơn hàng</h1>
      </div>
      
      <div class="filters-container">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Tìm kiếm đơn hàng..."
          >
        </div>
        
        <div class="filter-controls">
          <select v-model="statusFilter" class="form-control">
            <option value="all">Tất cả trạng thái</option>
            <option v-for="status in orderStatuses" :key="status" :value="status">
              {{ status }}
            </option>
          </select>
          
          <select v-model="sortOrder" class="form-control">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Giá cao nhất</option>
            <option value="lowest">Giá thấp nhất</option>
          </select>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="orders.length === 0" class="no-orders">
        <p>Chưa có đơn hàng nào.</p>
      </div>
      
      <div v-else-if="filteredOrders.length === 0" class="no-orders">
        <p>Không tìm thấy đơn hàng phù hợp với bộ lọc.</p>
        <button @click="statusFilter = 'all'; searchQuery = ''" class="btn btn-primary">
          Xóa bộ lọc
        </button>
      </div>
      
      <div v-else class="orders-table-container">
        <table class="orders-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Địa chỉ</th>
              <th>Số điện thoại</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.id">
              <td>#{{ order.id.slice(0, 8) }}</td>
              <td>{{ new Date(order.createdAt).toLocaleDateString() }}</td>
              <td>{{ order.address }}</td>
              <td>{{ order.phone }}</td>
              <td>{{ order.totalAmount.toLocaleString() }}đ</td>
              <td>
                <span class="status-badge" :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td>
                <button @click="viewOrderDetails(order)" class="btn-view">
                  Xem chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Order Details Modal -->
      <div v-if="showModal && selectedOrder" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Chi tiết đơn hàng #{{ selectedOrder.id.slice(0, 8) }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="order-info">
              <div class="info-group">
                <h3>Thông tin đơn hàng</h3>
                <p><strong>Ngày đặt:</strong> {{ new Date(selectedOrder.createdAt).toLocaleString() }}</p>
                <p><strong>Trạng thái hiện tại:</strong> 
                  <span class="status-badge" :class="getStatusClass(selectedOrder.status)">
                    {{ selectedOrder.status }}
                  </span>
                </p>
                <p><strong>Phương thức thanh toán:</strong> {{ selectedOrder.paymentMethod }}</p>
                <p><strong>Tổng tiền:</strong> {{ selectedOrder.totalAmount.toLocaleString() }}đ</p>
              </div>
              
              <div class="info-group">
                <h3>Thông tin giao hàng</h3>
                <p><strong>Địa chỉ:</strong> {{ selectedOrder.address }}</p>
                <p><strong>Số điện thoại:</strong> {{ selectedOrder.phone }}</p>
                <p v-if="selectedOrder.note"><strong>Ghi chú:</strong> {{ selectedOrder.note }}</p>
              </div>
            </div>
            
            <h3>Danh sách món ăn</h3>
            <div class="order-items-table-container">
              <table class="order-items-table">
                <thead>
                  <tr>
                    <th>Món ăn</th>
                    <th>Đơn giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td>{{ item.name }}</td>
                    <td>{{ item.price.toLocaleString() }}đ</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ (item.price * item.quantity).toLocaleString() }}đ</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="total-label">Tổng cộng:</td>
                    <td class="total-price">{{ selectedOrder.totalAmount.toLocaleString() }}đ</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            
            <div v-if="selectedOrder.status !== 'Đã giao hàng' && selectedOrder.status !== 'Đã hủy'" class="update-status">
              <h3>Cập nhật trạng thái</h3>
              <div class="status-actions">
                <button 
                  v-for="status in orderStatuses" 
                  :key="status"
                  @click="updateStatus(status)" 
                  class="btn"
                  :class="[
                    status === 'Đã hủy' ? 'btn-danger' : 'btn-primary',
                    selectedOrder.status === status ? 'btn-disabled' : ''
                  ]"
                  :disabled="selectedOrder.status === status"
                >
                  {{ status }}
                </button>
              </div>
            </div>
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

.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 2;
  min-width: 250px;
}

.filter-controls {
  flex: 1;
  display: flex;
  gap: 16px;
}

.filter-controls select {
  flex: 1;
  min-width: 150px;
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

.no-orders {
  text-align: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-orders button {
  margin-top: 16px;
}

.orders-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th,
.orders-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--light-gray);
}

.orders-table th {
  font-weight: 600;
  color: var(--secondary);
  background-color: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-processing {
  background-color: #fff8e1;
  color: #ffa000;
}

.status-shipping {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-delivered {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-canceled {
  background-color: #ffebee;
  color: #d32f2f;
}

.btn-view {
  background-color: var(--secondary);
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--secondary);
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--gray);
}

.modal-body {
  padding: 24px;
}

.order-info {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.info-group h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--secondary);
  font-size: 1.1rem;
}

.info-group p {
  margin: 8px 0;
}

.order-items-table-container {
  margin-bottom: 24px;
  overflow-x: auto;
}

.order-items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.order-items-table th,
.order-items-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--light-gray);
}

.order-items-table th {
  font-weight: 600;
  color: var(--secondary);
  background-color: #f8f9fa;
}

.order-items-table tfoot td {
  border-bottom: none;
  padding-top: 16px;
}

.total-label {
  text-align: right;
  font-weight: 600;
}

.total-price {
  font-weight: 700;
  color: var(--primary);
}

.update-status h3 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--secondary);
  font-size: 1.1rem;
}

.status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .order-info {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .admin-content {
    margin-left: 0;
    padding: 16px;
  }
  
  .filter-controls {
    flex-direction: column;
    width: 100%;
  }
  
  .status-actions {
    flex-direction: column;
  }
  
  .status-actions .btn {
    width: 100%;
  }
}
</style>