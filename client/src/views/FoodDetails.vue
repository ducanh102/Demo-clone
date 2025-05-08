<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import axios from '../utils/axios';

const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const toast = useToast();

const food = ref(null);
const reviews = ref([]);
const isLoading = ref(true);
const similarFoods = ref([]);
const quantity = ref(1);

// Review form
const reviewForm = ref({
  rating: 5,
  comment: ''
});
const isSubmittingReview = ref(false);

// Check if user is authenticated
const isLoggedIn = computed(() => authStore.isAuthenticated);

// Load food details and reviews
onMounted(async () => {
  const foodId = route.params.id;
  
  try {
    // Get food details and reviews in parallel
    const [foodResponse, reviewsResponse] = await Promise.all([
      axios.get(`/api/foods/${foodId}`),
      axios.get(`/api/reviews/food/${foodId}`)
    ]);
    
    food.value = foodResponse.data;
    reviews.value = reviewsResponse.data;
    
    // Get similar foods
    const similarResponse = await axios.get('/api/foods');
    similarFoods.value = similarResponse.data
      .filter(f => f.category === food.value.category && f.id !== food.value.id)
      .slice(0, 4);
    
    isLoading.value = false;
  } catch (error) {
    console.error('Error loading food details:', error);
    toast.error('Không thể tải thông tin món ăn');
    isLoading.value = false;
  }
});

// Add to cart
function addToCart() {
  if (quantity.value < 1) return;
  
  for (let i = 0; i < quantity.value; i++) {
    cartStore.addItem(food.value);
  }
}

// Submit review
async function submitReview() {
  if (!isLoggedIn.value) {
    toast.error('Vui lòng đăng nhập để đánh giá');
    return;
  }
  
  if (!reviewForm.value.comment) {
    toast.error('Vui lòng nhập nội dung đánh giá');
    return;
  }
  
  isSubmittingReview.value = true;
  
  try {
    const reviewData = {
      foodId: food.value.id,
      rating: reviewForm.value.rating,
      comment: reviewForm.value.comment
    };
    
    const response = await axios.post('/api/reviews', reviewData);
    
    // Add new review to the list
    reviews.value.unshift(response.data);
    
    // Reset form
    reviewForm.value.rating = 5;
    reviewForm.value.comment = '';
    
    // Update food rating
    food.value.rating = (
      reviews.value.reduce((sum, review) => sum + review.rating, 0) / reviews.value.length
    ).toFixed(1);
    
    toast.success('Đánh giá của bạn đã được ghi nhận');
  } catch (error) {
    console.error('Error submitting review:', error);
    toast.error('Đánh giá thất bại. Vui lòng thử lại.');
  } finally {
    isSubmittingReview.value = false;
  }
}
</script>

<template>
  <div class="food-details-page">
    <div class="container">
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thông tin món ăn...</p>
      </div>
      
      <div v-else-if="!food" class="not-found">
        <h2>Không tìm thấy món ăn</h2>
        <router-link to="/menu" class="btn btn-primary">Quay lại thực đơn</router-link>
      </div>
      
      <div v-else>
        <!-- Food Details Section -->
        <div class="food-details">
          <div class="food-image-container">
            <img :src="food.image" :alt="food.name" class="food-image" />
          </div>
          
          <div class="food-info">
            <h1>{{ food.name }}</h1>
            
            <div class="food-rating">
              <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= Math.round(food.rating) }">
                ★
              </span>
              <span class="rating-text">({{ food.rating }})</span>
            </div>
            
            <div class="food-price">{{ food.price.toLocaleString() }}đ</div>
            
            <p class="food-description">{{ food.description }}</p>
            
            <div class="add-to-cart">
              <div class="quantity-selector">
                <button 
                  @click="quantity > 1 ? quantity-- : null"
                  class="quantity-btn"
                  :disabled="quantity <= 1"
                >
                  -
                </button>
                <span class="quantity">{{ quantity }}</span>
                <button 
                  @click="quantity++"
                  class="quantity-btn"
                >
                  +
                </button>
              </div>
              
              <button @click="addToCart" class="btn btn-primary add-cart-btn">
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>
        
        <!-- Reviews Section -->
        <section class="reviews-section">
          <h2>Đánh giá từ khách hàng</h2>
          
          <!-- Add Review Form -->
          <div v-if="isLoggedIn" class="add-review-form card">
            <h3>Thêm đánh giá của bạn</h3>
            
            <div class="rating-input">
              <label>Đánh giá:</label>
              <div class="star-rating">
                <span
                  v-for="star in 5"
                  :key="star"
                  class="rating-star"
                  :class="{ 'active': star <= reviewForm.rating }"
                  @click="reviewForm.rating = star"
                >
                  ★
                </span>
              </div>
            </div>
            
            <div class="form-group">
              <label for="comment">Đánh giá:</label>
              <textarea
                id="comment"
                v-model="reviewForm.comment"
                class="form-control"
                placeholder="Nhập cảm nghĩ của bạn về món ăn này..."
                rows="3"
              ></textarea>
            </div>
            
            <button 
              @click="submitReview" 
              class="btn btn-primary"
              :disabled="isSubmittingReview"
            >
              {{ isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá' }}
            </button>
          </div>
          
          <div v-else class="login-prompt card">
            <p>Vui lòng <router-link to="/login">đăng nhập</router-link> để đánh giá món ăn này.</p>
          </div>
          
          <!-- Reviews List -->
          <div v-if="reviews.length > 0" class="reviews-list">
            <div v-for="review in reviews" :key="review.id" class="review-item card">
              <div class="review-header">
                <div class="reviewer-name">{{ review.userName }}</div>
                <div class="review-rating">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= review.rating }">
                    ★
                  </span>
                </div>
                <div class="review-date">
                  {{ new Date(review.createdAt).toLocaleDateString() }}
                </div>
              </div>
              
              <div class="review-content">
                {{ review.comment }}
              </div>
              
              <div v-if="review.adminReply" class="admin-reply">
                <div class="admin-reply-header">
                  <span class="admin-badge">Admin</span>
                  <span class="reply-text">đã phản hồi:</span>
                </div>
                <div class="admin-reply-content">
                  {{ review.adminReply }}
                </div>
              </div>
            </div>
          </div>
          
          <div v-else class="no-reviews">
            <p>Chưa có đánh giá nào cho món ăn này.</p>
          </div>
        </section>
        
        <!-- Similar Foods Section -->
        <section v-if="similarFoods.length > 0" class="similar-foods">
          <h2>Món ăn tương tự</h2>
          
          <div class="similar-foods-grid">
            <div v-for="similarFood in similarFoods" :key="similarFood.id" class="similar-food-card card">
              <router-link :to="`/food/${similarFood.id}`">
                <div class="similar-food-image">
                  <img :src="similarFood.image" :alt="similarFood.name" />
                </div>
                
                <div class="similar-food-info">
                  <h3>{{ similarFood.name }}</h3>
                  <p class="similar-food-price">{{ similarFood.price.toLocaleString() }}đ</p>
                </div>
              </router-link>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.food-details-page {
  padding: 32px 0;
}

.loading, .not-found {
  text-align: center;
  padding: 64px 0;
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

.food-details {
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;
  margin-bottom: 48px;
}

.food-image-container {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  height: 300px;
}

.food-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.food-info h1 {
  margin: 0 0 16px;
  color: var(--secondary);
  text-align: left;
}

.food-rating {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.star {
  color: #e0e0e0;
  font-size: 1.25rem;
  margin-right: 2px;
}

.star.filled {
  color: var(--warning);
}

.rating-text {
  color: var(--gray);
  margin-left: 8px;
}

.food-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 16px;
}

.food-description {
  margin-bottom: 24px;
  line-height: 1.6;
}

.add-to-cart {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-selector {
  display: flex;
  align-items: center;
  border: 1px solid var(--light-gray);
  border-radius: 4px;
}

.quantity-btn {
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  color: var(--gray);
  cursor: not-allowed;
}

.quantity {
  width: 32px;
  text-align: center;
}

.add-cart-btn {
  flex: 1;
  padding: 10px 16px;
}

/* Reviews Section */
.reviews-section {
  margin-bottom: 48px;
}

.reviews-section h2 {
  margin-bottom: 24px;
  color: var(--secondary);
}

.add-review-form, .login-prompt {
  padding: 24px;
  margin-bottom: 24px;
}

.login-prompt {
  text-align: center;
}

.login-prompt a {
  color: var(--primary);
  text-decoration: underline;
}

.rating-input {
  margin-bottom: 16px;
}

.star-rating {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.rating-star {
  font-size: 1.5rem;
  color: #e0e0e0;
  cursor: pointer;
}

.rating-star.active {
  color: var(--warning);
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.review-item {
  padding: 16px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reviewer-name {
  font-weight: 600;
}

.review-date {
  color: var(--gray);
  font-size: 0.85rem;
  margin-left: auto;
}

.review-content {
  margin-bottom: 16px;
  line-height: 1.6;
}

.admin-reply {
  border-left: 3px solid var(--secondary);
  padding-left: 16px;
  margin-top: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  padding: 12px;
  border-radius: 0 4px 4px 0;
}

.admin-reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.admin-badge {
  background-color: var(--secondary);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

.reply-text {
  color: var(--gray);
  font-size: 0.85rem;
}

.admin-reply-content {
  color: var(--dark);
}

.no-reviews {
  text-align: center;
  padding: 24px;
  color: var(--gray);
}

/* Similar Foods Section */
.similar-foods h2 {
  margin-bottom: 24px;
  color: var(--secondary);
}

.similar-foods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

.similar-food-card {
  overflow: hidden;
  transition: transform 0.3s ease;
}

.similar-food-card:hover {
  transform: translateY(-5px);
}

.similar-food-image {
  height: 150px;
  overflow: hidden;
}

.similar-food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.similar-food-card:hover .similar-food-image img {
  transform: scale(1.05);
}

.similar-food-info {
  padding: 16px;
}

.similar-food-info h3 {
  margin: 0 0 8px;
  font-size: 1rem;
}

.similar-food-price {
  color: var(--primary);
  font-weight: 600;
  margin: 0;
}

@media (min-width: 768px) {
  .food-details {
    grid-template-columns: 1fr 1fr;
  }
  
  .food-image-container {
    height: 400px;
  }
}

@media (min-width: 1024px) {
  .food-image-container {
    height: 500px;
  }
}
</style>