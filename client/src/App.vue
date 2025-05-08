<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useRoute } from 'vue-router';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';

const authStore = useAuthStore();
const route = useRoute();

onMounted(() => {
  authStore.initializeAuth();
});
</script>

<template>
  <div class="app-container">
    <Navbar v-if="!route.meta.hideNavbar" />
    <main>
      <router-view></router-view>
    </main>
    <Footer v-if="!route.meta.hideFooter" />
  </div>
</template>

<style>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
}
</style>