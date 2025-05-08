import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

export const useCartStore = defineStore('cart', () => {
  const toast = useToast();
  const items = ref([]);
  
  const totalItems = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });
  
  const totalPrice = computed(() => {
    return items.value.reduce((total, item) => {
      return total + item.price * item.quantity;
    }, 0);
  });
  
  // Initialize cart from localStorage
  function initializeCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      items.value = JSON.parse(savedCart);
    }
  }
  
  // Save cart to localStorage
  function saveCart() {
    localStorage.setItem('cart', JSON.stringify(items.value));
  }
  
  // Add item to cart
  function addItem(food) {
    const existingItem = items.value.find(item => item.id === food.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
      toast.info(`Increased ${food.name} quantity`);
    } else {
      items.value.push({
        id: food.id,
        name: food.name,
        price: food.price,
        image: food.image,
        quantity: 1
      });
      toast.success(`Added ${food.name} to cart`);
    }
    
    saveCart();
  }
  
  // Remove item from cart
  function removeItem(id) {
    const index = items.value.findIndex(item => item.id === id);
    if (index !== -1) {
      const removedItem = items.value[index];
      items.value.splice(index, 1);
      toast.info(`Removed ${removedItem.name} from cart`);
      saveCart();
    }
  }
  
  // Update item quantity
  function updateQuantity(id, quantity) {
    const item = items.value.find(item => item.id === id);
    if (item) {
      if (quantity <= 0) {
        removeItem(id);
      } else {
        item.quantity = quantity;
        saveCart();
      }
    }
  }
  
  // Clear cart
  function clearCart() {
    items.value = [];
    localStorage.removeItem('cart');
  }
  
  // Initialize cart on store creation
  initializeCart();
  
  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
});