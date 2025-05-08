<script setup>
import { ref, onMounted, computed } from 'vue';
import AdminSidebar from '../../components/admin/AdminSidebar.vue';
import axios from '../../utils/axios';
import { useToast } from 'vue-toastification';

const toast = useToast();
const reviews = ref([]);
const isLoading = ref(true);
const selectedReview = ref(null);
const showModal = ref(false);
const replyText = ref('');
const isSubmitting = ref(false);

// Filters
const filterByRating = ref('all');
const searchQuery = ref('');
const sortBy = ref('newest');

// Computed filtered reviews
const filteredReviews = computed(() => {
  let result = [...reviews.value];
  
  // Filter by rating
  if (filterByRating.value !== 'all') {
    const rating = parseInt(filterByRating.value);
    result = result.filter(review => review.rating === rating);
  }
  
  // Filter by search text
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(review => 
      review.comment.toLowerCase().includes(query) ||
      review.userName.toLowerCase().includes(query) ||
      (review.adminReply && review.adminReply.toLowerCase().includes(query))
    );
  }
  
  // Sort reviews
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } else if (sortBy.value === 'oldest') {
    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else if (sortBy.value === 'highest') {
    result.sort((a, b) => b.rating - a.rating);
  } else if (sortBy.value === 'lowest') {
    result.sort((a, b) => a.rating - b.rating);
  }
  
  return result;
});

// Load reviews data
onMounted(async () => {
  try {
    const response = await axios.get('/api/reviews');
    
    // Fetch food details for each review
    const reviewsWithFood = await Promise.all(
      response.data.map(async (review) => {
        try {
          const foodResponse = await axios.get(`/api/foods/${review.foodId}`);
          return {
            ...review,
            foodName: foodResponse.data.name,
            foodImage: foodResponse.data.image
          };
        } catch (error) {
          return {
            ...review,
            foodName: 'Món ăn không tồn tại',
            foodImage: ''
          };
        }
      })
    );
    
    reviews.value = reviewsWithFood;
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading reviews:', error);
    toast.error('Không thể tải dữ liệu đánh giá');
    isLoading.value = false;
  }
});

// Open reply modal
function openReplyModal(review) {
  selectedReview.value = review;
  replyText.value = review.adminReply || '';
  showModal.value = true;
}

// Close modal
function closeModal() {
  showModal.value = false;
  selectedReview.value = null;
  replyText.value = '';
}

// Submit reply
async function submitReply() {
  if (!replyText.value.trim()) {
    toast.error('Vui lòng nhập nội dung phản hồi');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    const response = await axios.put(`/api/reviews/${selectedReview.value.id}`, {
      adminReply: replyText.value.trim()
    });
    
    // Update review in the list
    const index = reviews.value.findIndex(r => r.id === selectedReview.value.id);
    if (index !== -1) {
      reviews.value[index].adminReply = response.data.adminReply;
    }
    
    toast.success('Phản hồi thành công');
    closeModal();
  } catch (error) {
    console.error('Error submitting reply:', error);
    toast.error('Phản hồi thất bại. Vui lòng thử lại.');
  } finally {
    isSubmitting.value = false;
  }
}

// Delete review
async function deleteReview(review) {
  if (!confirm(`Bạn có chắc chắn muốn xóa đánh giá này không?`)) {
    return;
  }
  
  try {
    await axios.delete(`/api/reviews/${review.id}`);
    
    // Remove from list
    reviews.value = reviews.value.filter(r => r.id !== review.id);
    
    toast.success('Xóa đánh giá thành công');
  } catch (error) {
    console.error('Error deleting review:', error);
    toast.error('Xóa đánh giá thất bại');
  }
}
</script>

<template>
  <div class="admin-layout">
    <AdminSidebar />
    
    <div class="admin-content">
      <div class="admin-header">
        <h1>Quản lý đánh giá</h1>
      </div>
      
      <div class="filters-container">
        <div class="search-box">
          <input 
            type="text" 
            v-model="searchQuery" 
            class="form-control" 
            placeholder="Tìm kiếm đánh giá..."
          >
        </div>
        
        <div class="filter-controls">
          <select v-model="filterByRating" class="form-control">
            <option value="all">Tất cả đánh giá</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
          
          <select v-model="sortBy" class="form-control">
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="highest">Đánh giá cao nhất</option>
            <option value="lowest">Đánh giá thấp nhất</option>
          </select>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải dữ liệu đánh giá...</p>
      </div>
      
      <div v-else-if="reviews.length === 0" class="no-reviews">
        <p>Chưa có đánh giá nào.</p>
      </div>
      
      <div v-else-if="filteredReviews.length === 0" class="no-reviews">
        <p>Không tìm thấy đánh giá phù hợp với bộ lọc.</p>
        <button @click="filterByRating = 'all'; searchQuery = ''" class="btn btn-primary">
          Xóa bộ lọc
        </button>
      </div>
      
      <div v-else class="reviews-grid">
        <div v-for="review in filteredReviews" :key="review.id" class="review-card card">
          <div class="review-header">
            <div class="food-info">
              <div class="food-image">
                <img :src="review.foodImage" :alt="review.foodName" />
              </div>
              <div class="food-name">{{ review.foodName }}</div>
            </div>
            
            <div class="review-meta">
              <div class="review-rating">
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= review.rating }">
                  ★
                </span>
              </div>
              <div class="review-date">
                {{ new Date(review.createdAt).toLocaleDateString() }}
              </div>
            </div>
          </div>
          
          <div class="review-body">
            <div class="reviewer">
              <strong>{{ review.userName }}</strong> đánh giá:
            </div>
            <div class="review-text">
              {{ review.comment }}
            </div>
          </div>
          
          <div v-if="review.adminReply" class="admin-reply">
            <div class="admin-reply-header">
              <span class="admin-badge">Admin</span>
              <span>đã phản hồi:</span>
            </div>
            <div class="admin-reply-text">
              {{ review.adminReply }}
            </div>
          </div>
          
          <div class="review-actions">
            <button @click="openReplyModal(review)" class="btn btn-primary">
              {{ review.adminReply ? 'Chỉnh sửa phản hồi' : 'Phản hồi' }}
            </button>
            <button @click="deleteReview(review)" class="btn btn-danger">Xóa</button>
          </div>
        </div>
      </div>
      
      <!-- Reply Modal -->
      <div v-if="showModal && selectedReview" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h2>
              {{ selectedReview.adminReply ? 'Chỉnh sửa phản hồi' : 'Thêm phản hồi' }}
            </h2>
            <button @click="closeModal" class="modal-close">&times;</button>
          </div>
          
          <div class="modal-body">
            <div class="review-summary">
              <div class="review-food">
                <strong>Món ăn:</strong> {{ selectedReview.foodName }}
              </div>
              <div class="reviewer-info">
                <strong>Khách hàng:</strong> {{ selectedReview.userName }}
              </div>
              <div class="review-rating">
                <strong>Đánh giá:</strong>
                <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= selectedReview.rating }">
                  ★
                </span>
              </div>
              <div class="review-date">
                <strong>Ngày đánh giá:</strong> 
                {{ new Date(selectedReview.createdAt).toLocaleDateString() }}
              </div>
              <div class="review-comment">
                <strong>Nội dung đánh giá:</strong>
                <p>{{ selectedReview.comment }}</p>
              </div>
            </div>
            
            <div class="form-group">
              <label for="replyText">Phản hồi của Admin:</label>
              <textarea 
                id="replyText" 
                v-model="replyText" 
                class="form-control"
                placeholder="Nhập phản hồi của bạn..."
                rows="5"
              ></textarea>
            </div>
          </div>
          
          <div class="modal-footer">
            <button @click="closeModal" class="btn btn-secondary">Hủy bỏ</button>
            <button 
              @click="submitReply" 
              class="btn btn-primary"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Đang xử lý...' : 'Gửi phản hồi' }}
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

.no-reviews {
  text-align: center;
  padding: 48px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.no-reviews button {
  margin-top: 16px;
}

.reviews-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.review-card {
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.food-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.food-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-name {
  font-weight: 600;
  color: var(--secondary);
}

.review-meta {
  text-align: right;
}

.review-rating {
  margin-bottom: 4px;
}

.review-date {
  font-size: 0.85rem;
  color: var(--gray);
}

.star {
  color: #e0e0e0;
  font-size: 1rem;
}

.star.filled {
  color: var(--warning);
}

.review-body {
  margin-bottom: 16px;
}

.reviewer {
  margin-bottom: 8px;
}

.review-text {
  line-height: 1.5;
}

.admin-reply {
  background-color: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.admin-reply-header {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.admin-badge {
  background-color: var(--secondary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.review-actions {
  display: flex;
  gap: 12px;
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
  max-width: 600px;
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

.review-summary {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.review-summary > div {
  margin-bottom: 8px;
}

.review-summary > div:last-child {
  margin-bottom: 0;
}

.review-comment p {
  margin-top: 8px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--light-gray);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 1;
}

@media (min-width: 768px) {
  .reviews-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .admin-content {
    margin-left: 0;
    padding: 16px;
  }
  
  .review-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .review-meta {
    text-align: left;
    margin-top: 8px;
  }
  
  .filter-controls {
    flex-direction: column;
    width: 100%;
  }
}
</style>