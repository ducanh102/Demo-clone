<script setup>
import { useCartStore } from '../../stores/cart';
import { defineProps } from 'vue';

const props = defineProps({
  food: {
    type: Object,
    required: true
  }
});

const cartStore = useCartStore();

function addToCart() {
  cartStore.addItem(props.food);
}
</script>

<template>
  <div class="food-card card">
    <div class="food-image">
      <img :src="food.image" :alt="food.name" />
    </div>
    <div class="food-info">
      <router-link :to="{ name: 'food-details', params: { id: food.id } }">
        <h3 class="food-name">{{ food.name }}</h3>
      </router-link>
      <div class="food-rating">
        <span v-for="i in 5" :key="i" class="star">
          ★
        </span>
        <span class="rating-text">({{ food.rating }})</span>
      </div>
      <p class="food-description">{{ food.description.slice(0, 80) }}{{ food.description.length > 80 ? '...' : '' }}</p>
      <div class="food-footer">
        <span class="food-price">{{ food.price.toLocaleString() }}đ</span>
        <button @click="addToCart" class="btn btn-primary add-to-cart-btn">
          <span class="btn-icon">+</span>
          Thêm vào giỏ
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.food-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.food-image {
  height: 200px;
  overflow: hidden;
}

.food-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.food-card:hover .food-image img {
  transform: scale(1.05);
}

.food-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.food-name {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--dark);
  font-weight: 600;
}

.food-name:hover {
  color: var(--primary);
}

.food-rating {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.star {
  color: var(--warning);
  margin-right: 2px;
  font-size: 1rem;
}

.rating-text {
  color: var(--gray);
  font-size: 0.85rem;
  margin-left: 4px;
}

.food-description {
  color: var(--gray);
  margin-bottom: 16px;
  font-size: 0.9rem;
  flex-grow: 1;
}

.food-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-price {
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--primary);
}

.add-to-cart-btn {
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
}

.btn-icon {
  font-weight: bold;
  font-size: 1rem;
}
</style>