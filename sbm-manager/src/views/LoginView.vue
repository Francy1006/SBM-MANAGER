<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header text-center mb-4">
        <!-- <img src="../assets/img/logo.jpg" alt="Logo" class="login-logo mb-3" /> -->
        <h2 class="login-title text-primary">SBM Manager</h2>
        <p class="login-subtitle text-muted">Sistema de Gestión de Negocios</p>
      </div>

      <GoogleLoginComponent @login-success="handleLoginSuccess" />
    </div>
  </div>
</template>

<script setup>
import GoogleLoginComponent from '../components/GoogleLoginComponent.vue';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const { setAuthenticatedUser } = useAuth();
const router = useRouter();

const handleLoginSuccess = (userData) => {
  setAuthenticatedUser(userData);
  router.push('/');
};
</script>