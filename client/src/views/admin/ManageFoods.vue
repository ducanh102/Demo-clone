<script setup>
import { ref, onMounted } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import axios from '../../utils/axios';
import { useToast } from 'vue-toastification';

const toast = useToast();
const foods = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const showModal = ref(false);
const modalType = ref('add'); // 'add' or 'edit'

// Form data
const foodForm = ref({
  id: '',
  name: '',
  description: '',
  price: '',
  category: '',
  image: '',
  popular: false
});

// Get file input ref for reset
const fileInput = ref(null);

// For image preview
const imagePreview = ref('');

// Filter and search
const searchQuery = ref('');
const selectedCategory = ref('all');

// Filtered foods
const filteredFoods = computed(() => {
  let result = foods.value;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(food => food.category === selectedCategory.value);
  }
  
  // Filter by search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(food => 
      food.name.toLowerCase().includes(query) || 
      food.description.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// Load data
onMounted(async () => {
  try {
    const [foodsRes, categoriesRes] = await Promise.all([
      axios.get('/api/foods'),
      axios.get('/api/categories')
    ]);
    
    foods.value = foodsRes.data;
    categories.value = categoriesRes.data;
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Không thể tải dữ liệu');
    isLoading.value = false;
  }
});

// Open modal for adding food
function openAddModal() {
  modalType.value = 'add';
  resetForm();
  showModal.value = true;
}

// Open modal for editing food
function openEditModal(food) {
  modalType.value = 'edit';
  resetForm();
  
  foodForm.value = {
    id: food.id,
    name: food.name,
    description: food.description,
    price: food.price.toString(),
    category: food.category,
    image: food.image,
    popular: food.popular
  };
  
  imagePreview.value = food.image;
  showModal.value = true;
}

// Close modal
function closeModal() {
  showModal.value = false;
}

// Reset form
function resetForm() {
  foodForm.value = {
    id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    popular: false
  };
  
  imagePreview.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

// Handle image change
function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  if (!file.type.startsWith('image/')) {
    toast.error('Vui lòng chọn file hình ảnh');
    fileInput.value.value = '';
    return;
  }
  
  // Create image preview
  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Submit form
async function submitForm() {
  if (!foodForm.value.name || !foodForm.value.description || !foodForm.value.price || !foodForm.value.category) {
    toast.error('Vui lòng nhập đầy đủ thông tin');
    return;
  }
  
  // Check if price is a valid number
  if (isNaN(parseFloat(foodForm.value.price)) || parseFloat(foodForm.value.price) <= 0) {
    toast.error('Giá không hợp lệ');
    return;
  }
  
  // If adding new food, image is required
  if (modalType.value === 'add' && !imagePreview.value && !fileInput.value?.files[0]) {
    toast.error('Vui lòng chọn hình ảnh');
    return;
  }
  
  try {
    const formData = new FormData();
    formData.append('name', foodForm.value.name);
    formData.append('description', foodForm.value.description);
    formData.append('price', foodForm.value.price);
    formData.append('category', foodForm.value.category);
    formData.append('popular', foodForm.value.popular);
    
    // Add image if a new file is selected
    if (fileInput.value?.files[0]) {
      formData.append('image', fileInput.value.files[0]);
    } else if (foodForm.value.image) {
      formData.append('image', foodForm.value.image);
    }
    
    let response;
    
    // Add or edit food
    if (modalType.value === 'add') {
      response = await axios.post('/api/foods', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      foods.value.push(response.data);
      toast.success('Thêm món ăn thành công');
    } else {
      response = await axios.put(`/api/foods/${foodForm.value.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update food in list
      const index = foods.value.findIndex(f => f.id === foodForm.value.id);
      if (index !== -1) {
        foods.value[index] = response.data;
      }
      
      toast.success('Cập nhật món ăn thành công');
    }
    
    closeModal();
  } catch (error) {
    console.error('Error submitting food:', error);
    toast.error('Thao tác thất bại. Vui lòng thử lại.');
  }
}

// Delete food
async function deleteFood(food) {
  if (!confirm(`Bạn có chắc chắn muốn xóa món ${food.name} không?`)) {
    return;
  }
  
  try {
    await axios.delete(`/api/foods/${food.id}`);
    
    // Remove from list
    foods.value = foods.value.filter(f => f.id !== food.id);
    
    toast.success('Xóa món ăn thành công');
  } catch (error) {
    console.error('Error deleting food:', error);
    toast.error('Xóa thất bại. Vui lòng thử lại.');
  }
}

// Get category name
function getCategoryName(categoryId) {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : 'Không có danh mục';
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <div class="admin-header">
        <h1>Quản lý món ăn</h1>
        <button @click="openAddModal" class="btn btn-primary add-btn">
          <span class="btn-icon">+</span> Thêm món ăn mới
        </button>
      </div>
      
      <div class="filter-container">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Tìm kiếm món ăn..."
          >
        </div>
        
        <div class="category-filter">
          <select v-model="selectedCategory" class="form-control">
            <option value="all">Tất cả danh mục</option>
            <option 
              v-for="category in categories" 
              :key="category.id" 
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
      
      <div v-else-if="!filteredFoods || filteredFoods.length === 0" class="no-items">
        <p>Không có món ăn nào.</p>
      </div>
      
      <div v-else class="foods-table-container">
        <table class="foods-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên món</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Đánh giá</th>
              <th>Nổi bật</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="food in filteredFoods" :key="food.id">
              <td>
                <img :src="food.image" :alt="food.name" class="food-thumbnail">
              </td>
              <td>
                <div class="food-name">{{ food.name }}</div>
                <div class="food-description">
                  {{ food.description.slice(0, 50) }}{{ food.description.length > 50 ? '...' : '' }}
                </div>
              </td>
              <td>{{ getCategoryName(food.category) }}</td>
              <td>{{ food.price.toLocaleString() }}đ</td>
              <td>⭐ {{ food.rating }}</td>
              <td>
                <span 
                  class="status-badge" 
                  :class="food.popular ? 'status-active' : 'status-inactive'"
                >
                  {{ food.popular ? 'Có' : 'Không' }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button @click="openEditModal(food)" class="btn-edit">
                    ✏️
                  </button>
                  <button @click="deleteFood(food)" class="btn-delete">
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Add/Edit Food Modal -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ modalType === 'add' ? 'Thêm món ăn mới' : 'Cập nhật món ăn' }}</h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="form-grid">
              <div class="form-group">
                <label for="name">Tên món ăn*</label>
                <input 
                  type="text" 
                  id="name" 
                  v-model="foodForm.name" 
                  class="form-control"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="price">Giá (VNĐ)*</label>
                <input 
                  type="number" 
                  id="price" 
                  v-model="foodForm.price" 
                  class="form-control"
                  min="1000"
                  step="1000"
                  required
                >
              </div>
              
              <div class="form-group">
                <label for="category">Danh mục*</label>
                <select 
                  id="category" 
                  v-model="foodForm.category" 
                  class="form-control"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  <option 
                    v-for="category in categories" 
                    :key="category.id" 
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label for="popular">Nổi bật</label>
                <div class="checkbox-group">
                  <input 
                    type="checkbox" 
                    id="popular" 
                    v-model="foodForm.popular"
                  >
                  <label for="popular" class="checkbox-label">Đánh dấu là món ăn nổi bật</label>
                </div>
              </div>
              
              <div class="form-group full-width">
                <label for="description">Mô tả*</label>
                <textarea 
                  id="description" 
                  v-model="foodForm.description" 
                  class="form-control"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div class="form-group full-width">
                <label for="image">Hình ảnh{{ modalType === 'add' ? '*' : '' }}</label>
                <input 
                  type="file" 
                  id="image" 
                  ref="fileInput"
                  @change="handleImageChange" 
                  class="form-control"
                  accept="image/*"
                >
                
                <div v-if="imagePreview" class="image-preview">
                  <img :src="imagePreview" alt="Preview">
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary">Hủy bỏ</button>
            <button @click="submitForm" class="btn btn-primary">
              {{ modalType === 'add' ? 'Thêm món ăn' : 'Cập nhật' }}
            </button>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.admin-header h1 {
  margin: 0;
  color: var(--secondary);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-weight: bold;
}

.filter-container {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.search-box {
  flex: 2;
}

.category-filter {
  flex: 1;
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

.no-items {
  text-align: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.foods-table-container {
  overflow-x: auto;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.foods-table {
  width: 100%;
  border-collapse: collapse;
}

.foods-table th,
.foods-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--light-gray);
}

.foods-table th {
  font-weight: 600;
  color: var(--secondary);
  background-color: #f8f9fa;
}

.food-thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.food-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.food-description {
  font-size: 0.85rem;
  color: var(--gray);
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-active {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-inactive {
  background-color: #f5f5f5;
  color: #757575;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.btn-edit:hover, .btn-delete:hover {
  opacity: 1;
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

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-label {
  margin-bottom: 0;
}

.image-preview {
  margin-top: 12px;
  width: 100%;
  max-height: 200px;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid var(--light-gray);
}

.image-preview img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--light-gray);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .admin-content {
    margin-left: 0;
    padding: 16px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .admin-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-container {
    flex-direction: column;
  }
}
</style>