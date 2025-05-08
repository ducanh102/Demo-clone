<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartItems = computed(() => cartStore.items);
const totalItems = computed(() => cartStore.totalItems);
const totalPrice = computed(() => cartStore.totalPrice);
const isEmpty = computed(() => cartItems.value.length === 0);

function removeItem(id) {
  cartStore.removeItem(id);
}

function updateQuantity(id, newQuantity) {
  if (newQuantity >= 1) {
    cartStore.updateQuantity(id, newQuantity);
  }
}

function proceedToCheckout() {
  if (authStore.isAuthenticated) {
    router.push('/checkout');
  } else {
    router.push({ name: 'login', query: { redirect: '/checkout' } });
  }
}

function continueShopping() {
  router.push('/menu');
}
</script>

<template>
  <div class="cart-page">
    <div class="container">
      <h1>Giỏ hàng</h1>
      
      <div v-if="isEmpty" class="empty-cart">
        <div class="empty-cart-icon">🛒</div>
        <h2>Giỏ hàng trống</h2>
        <p>Thêm món ăn vào giỏ hàng để tiến hành đặt hàng.</p>
        <button @click="continueShopping" class="btn btn-primary">Xem thực đơn</button>
      </div>
      
      <div v-else class="cart-content">
        <div class="cart-items">
          <div v-for="item in cartItems" :key="item.id" class="cart-item card">
            <div class="item-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-price">{{ item.price.toLocaleString() }}đ</p>
            </div>
            
            <div class="item-quantity">
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button 
                class="quantity-btn" 
                @click="updateQuantity(item.id, item.quantity + 1)"
              >
                +
              </button>
            </div>
            
            <div class="item-subtotal">
              <p>{{ (item.price * item.quantity).toLocaleString() }}đ</p>
            </div>
            
            <button @click="removeItem(item.id)" class="remove-btn">
              ×
            </button>
          </div>
        </div>
        
        <div class="cart-summary card">
          <h3>Tổng đơn hàng</h3>
          
          <div class="summary-item">
            <span>Số lượng:</span>
            <span>{{ totalItems }} món</span>
          </div>
          
          <div class="summary-item">
            <span>Tổng tiền:</span>
            <span class="total-price">{{ totalPrice.toLocaleString() }}đ</span>
          </div>
          
          <button @click="proceedToCheckout" class="btn btn-primary checkout-btn">
            Tiến hành thanh toán
          </button>
          
          <button @click="continueShopping" class="btn btn-secondary continue-btn">
            Tiếp tục mua hàng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  padding: 32px 0;
}

h1 {
  text-align: center;
  margin-bottom: 32px;
  color: var(--secondary);
}

.empty-cart {
  text-align: center;
  padding: 64px 0;
  max-width: 500px;
  margin: 0 auto;
}

.empty-cart-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  color: var(--gray);
}

.empty-cart h2 {
  margin-bottom: 16px;
  color: var(--secondary);
}

.empty-cart p {
  margin-bottom: 24px;
  color: var(--gray);
}

.cart-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto auto;
  align-items: center;
  padding: 16px;
  gap: 16px;
  position: relative;
}

.item-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  overflow: hidden;
}

.item-details h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  color: var(--primary);
  font-weight: 600;
  margin: 0;
}

.item-quantity {
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: var(--light-gray);
  border: none;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  width: 24px;
  text-align: center;
}

.item-subtotal {
  font-weight: 600;
  min-width: 100px;
  text-align: right;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  color: var(--gray);
}

.remove-btn:hover {
  color: var(--danger);
}

.cart-summary {
  padding: 24px;
}

.cart-summary h3 {
  margin-top: 0;
  margin-bottom: 24px;
  color: var(--secondary);
  font-size: 1.25rem;
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.total-price {
  font-weight: 700;
  color: var(--primary);
  font-size: 1.25rem;
}

.checkout-btn, .continue-btn {
  width: 100%;
  margin-top: 24px;
  padding: 12px;
}

.continue-btn {
  margin-top: 12px;
  background-color: transparent;
  color: var(--secondary);
  border: 1px solid var(--secondary);
}

.continue-btn:hover {
  background-color: var(--light-gray);
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 60px 1fr;
  }
  
  .item-subtotal, .item-quantity {
    grid-column: 2;
    justify-self: start;
  }
  
  .item-quantity {
    margin-top: 8px;
  }
  
  .item-subtotal {
    margin-top: 8px;
  }
}

@media (min-width: 1024px) {
  .cart-content {
    grid-template-columns: 2fr 1fr;
  }
}
</style>