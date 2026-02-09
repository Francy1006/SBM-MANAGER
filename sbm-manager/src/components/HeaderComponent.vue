<template>
  <header class="app-header">
    <div>
      <!-- offset -->
    </div>

    <div v-if="userInfo.name" class="user-info">
      <div class="user-name">
        <small>Bienvenido </small>
        <span>{{ userInfo.name }}</span>
      </div>
      <button @click="handleLogout" class="btn-logout">
        <i class="fas fa-sign-out-alt me-1"></i>
        Cerrar Sesión
      </button>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const { userInfo, logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>
