<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from '../utils/axios';
import FoodCard from '../components/food/FoodCard.vue';

const foods = ref([]);
const categories = ref([]);
const isLoading = ref(true);
const searchQuery = ref('');
const selectedCategory = ref('all');

const filteredFoods = computed(() => {
  let result = foods.value;
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(food => food.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    result = result.filter(food => 
      food.name.toLowerCase().includes(query) || 
      food.description.toLowerCase().includes(query)
    );
  }
  
  return result;
});

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
    console.error('Error fetching data:', error);
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="menu-page">
    <div class="container">
      <div class="menu-header">
        <h1>Thực đơn</h1>
        
        <div class="filter-container">
          <!-- Search Box -->
          <div class="search-box">
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Tìm kiếm món ăn..."
              class="form-control"
            />
          </div>
          
          <!-- Category Filter -->
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
      </div>
      
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Đang tải thực đơn...</p>
      </div>
      
      <div v-else-if="filteredFoods.length === 0" class="no-results">
        <p>Không tìm thấy món ăn phù hợp.</p>
        <button @click="selectedCategory = 'all'; searchQuery = ''" class="btn btn-primary">
          Xóa bộ lọc
        </button>
      </div>
      
      <div v-else class="foods-grid">
        <FoodCard 
          v-for="food in filteredFoods" 
          :key="food.id" 
          :food="food" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.menu-page {
  padding: 32px 0;
}

.menu-header {
  margin-bottom: 32px;
}

.menu-header h1 {
  text-align: center;
  margin-bottom: 24px;
  color: var(--secondary);
}

.filter-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
}

.search-box, .category-filter {
  flex: 1;
}

.foods-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.loading, .no-results {
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

@media (min-width: 640px) {
  .filter-container {
    flex-direction: row;
  }
  
  .foods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 768px) {
  .foods-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .foods-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>