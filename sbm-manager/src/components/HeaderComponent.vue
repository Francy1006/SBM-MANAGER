<template>
  <header style="background:#e53935; color:white; padding:1rem; display:flex; justify-content:space-between; align-items:center; font-family: 'DINAlternate', Arial, sans-serif;">
    <div>
      <h1 style="margin:0;">
        <i class="fa-solid fa-cubes me-2"></i>
        SBM Manager
      </h1>
    </div>
    
    <!-- Información del usuario y logout -->
    <div v-if="userInfo.name" class="d-flex align-items-center">
      <div class="me-3">
        <small class="d-block">Bienvenido</small>
        <span class="fw-bold">{{ userInfo.name }}</span>
      </div>
      <button @click="handleLogout" class="btn btn-outline-light btn-sm">
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