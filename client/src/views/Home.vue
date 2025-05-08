<script setup>
import { ref, onMounted } from 'vue';
import axios from '../utils/axios';
import FoodCard from '../components/food/FoodCard.vue';

const popularFoods = ref([]);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await axios.get('/api/foods/popular');
    popularFoods.value = response.data;
    isLoading.value = false;
  } catch (error) {
    console.error('Error fetching popular foods:', error);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Ẩm thực đỉnh cao, giao hàng tận nhà</h1>
          <p>Quán Ăn Online mang đến cho bạn những món ăn ngon tuyệt với hương vị đậm đà, được giao hàng nhanh chóng tận nơi</p>
          <router-link to="/menu" class="btn btn-primary hero-btn">Xem thực đơn</router-link>
        </div>
      </div>
    </section>

    <!-- Popular Foods Section -->
    <section class="popular-foods">
      <div class="container">
        <h2 class="section-title">Món ăn nổi bật</h2>
        <div v-if="isLoading" class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <div v-else-if="popularFoods.length === 0" class="no-foods">
          <p>Chưa có món ăn nào.</p>
        </div>
        <div v-else class="foods-grid">
          <FoodCard 
            v-for="food in popularFoods" 
            :key="food.id" 
            :food="food" 
          />
        </div>
        <div class="view-all">
          <router-link to="/menu" class="btn btn-secondary">Xem tất cả món ăn</router-link>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Tại sao chọn chúng tôi?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🍲</div>
            <h3>Đồ ăn chất lượng</h3>
            <p>Tất cả món ăn được chế biến từ nguyên liệu tươi ngon, đảm bảo vệ sinh</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🚚</div>
            <h3>Giao hàng nhanh chóng</h3>
            <p>Cam kết giao hàng trong vòng 30 phút kể từ khi đặt hàng</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Giá cả hợp lý</h3>
            <p>Giá cả phù hợp với mọi đối tượng khách hàng</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">⭐</div>
            <h3>Đánh giá thực tế</h3>
            <p>Hệ thống đánh giá minh bạch từ khách hàng thực</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2');
  background-size: cover;
  background-position: center;
  color: white;
  padding: 100px 0;
  margin-bottom: 48px;
}

.hero-content {
  max-width: 600px;
  text-align: center;
  margin: 0 auto;
}

.hero h1 {
  font-size: 2.5rem;
  margin-bottom: 16px;
  line-height: 1.2;
}

.hero p {
  font-size: 1.1rem;
  margin-bottom: 24px;
  opacity: 0.9;
}

.hero-btn {
  padding: 12px 24px;
  font-size: 1.1rem;
}

.section-title {
  text-align: center;
  margin-bottom: 32px;
  font-size: 2rem;
  color: var(--secondary);
  position: relative;
}

.section-title::after {
  content: "";
  position: absolute;
  width: 80px;
  height: 3px;
  background-color: var(--primary);
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
}

.popular-foods {
  padding: 48px 0;
}

.foods-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.loading-spinner,
.no-foods {
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
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.view-all {
  text-align: center;
  margin-top: 32px;
}

.features {
  padding: 48px 0;
  background-color: var(--light-gray);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.feature-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 12px;
  color: var(--secondary);
}

.feature-card p {
  color: var(--gray);
}

@media (min-width: 640px) {
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .foods-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .features-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .hero h1 {
    font-size: 3rem;
  }
  
  .hero p {
    font-size: 1.25rem;
  }
}
</style>