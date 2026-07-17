<template>
  <div>
    <!-- Layout principal solo si está autenticado -->
    <div v-if="isAuthenticated" class="app-layout">
      <SidebarComponent />
      <div class="app-main">
        <HeaderComponent />
        <router-view />
        <FooterComponent />
      </div>
    </div>
    
    <!-- Router view para login si no está autenticado -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SidebarComponent from './components/SidebarComponent.vue';
import HeaderComponent from './components/HeaderComponent.vue';
import FooterComponent from './components/FooterComponent.vue';
import { useAuth } from './composables/useAuth';

const { isAuthenticated } = useAuth();
const route = useRoute();

// Mostrar layout solo si está autenticado y no está en la página de login
const shouldShowLayout = computed(() => {
  return isAuthenticated.value && route.path !== '/login';
});
</script>

<style scoped>
.app-layout {
  display: flex;
  width: 100%;
  max-width: 100vw;
}

.app-main {
  display: flex;
  min-width: 0;
  min-height: 100vh;
  flex: 1 1 auto;
  flex-direction: column;
}
</style>
