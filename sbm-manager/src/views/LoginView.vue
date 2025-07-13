<template>
  <div class="login-container">
    <div class="login-card">
      <div class="text-center mb-4">
        <img src="../assets/img/logo.jpg" alt="Logo" class="logo mb-3" />
        <h2 class="text-primary">SBM Manager</h2>
        <p class="text-muted">Sistema de Gestión de Negocios</p>
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

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}

.login-card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1rem 3rem rgba(0, 0, 0, 0.2);
  padding: 2rem;
  max-width: 400px;
  width: 100%;
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 50%;
}

@media (max-width: 768px) {
  .login-card {
    padding: 1.5rem;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style> 