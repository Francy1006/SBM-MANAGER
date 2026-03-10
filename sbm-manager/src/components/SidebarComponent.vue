<template>
  <aside class="sidebar">
    <router-link to="/" class="brand" style="text-decoration:none;">
      <i class="fa-solid fa-cubes"></i>
      <span class="brand-text">SBM Manager</span>
    </router-link>
    <ul class="nav">
      <li>
        <router-link to="/" class="nav-link" active-class="active" exact>
          <i class="fa-solid fa-home"></i>
          <span class="nav-text">Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/franquicias" class="nav-link" active-class="active">
          <i class="fa-solid fa-cube"></i>
          <span class="nav-text">Marcas</span>
        </router-link>
      </li>
      <li>
        <router-link to="/catalogos" class="nav-link" active-class="active">
          <i class="fa-solid fa-book"></i>
          <span class="nav-text">Catálogos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/productos" class="nav-link" active-class="active">
          <i class="fa-solid fa-dolly"></i>
          <span class="nav-text">Productos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/materiales" class="nav-link" active-class="active">
          <i class="fa-solid fa-spoon"></i>
          <span class="nav-text">Materiales</span>
        </router-link>
      </li>
      <li>
        <router-link to="/servicios" class="nav-link" active-class="active">
          <i class="fa-solid fa-people-carry"></i>
          <span class="nav-text">Servicios</span>
        </router-link>
      </li>
      <li>
        <router-link to="/menus" class="nav-link" active-class="active">
          <i class="fa-solid fa-atlas"></i>
          <span class="nav-text">Menús</span>
        </router-link>
      </li>
      <li>
        <router-link to="/proveedores" class="nav-link" active-class="active">
          <i class="fa-solid fa-industry"></i>
          <span class="nav-text">Proveedores</span>
        </router-link>
      </li>
      <li>
        <router-link to="/clientes" class="nav-link" active-class="active">
          <i class="fa-solid fa-user-tie"></i>
          <span class="nav-text">Clientes</span>
        </router-link>
      </li>
      <li>
        <a href="#" class="nav-link d-flex align-items-center" @click.prevent="showConfig = !showConfig">
          <i class="fa-solid fa-cog"></i>
          <span class="nav-text">Configuración</span>
          <i :class="['fa-solid', showConfig ? 'fa-chevron-up' : 'fa-chevron-down', 'ms-auto']"></i>
        </a>
        <ul v-show="showConfig" class="nav flex-column ms-4">
          <li>
            <router-link to="/configuracion/directiva-fiscal" class="nav-link sidebar-sublink" active-class="active">
              <i class="fa-solid fa-file-invoice"></i>
              <span class="nav-text">Directiva Fiscal</span>
            </router-link>
          </li>
        </ul>
      </li>
    </ul>
    <div class="user">
      <div class="user-info">
        <img :src="userAvatar" alt="user" />
        <div class="user-details">
          <span class="user-name">{{ userInfo.name || 'Usuario' }}</span>
          <span class="user-email">{{ userInfo.email || 'usuario@ejemplo.com' }}</span>
        </div>
      </div>
      <div class="user-actions">
        <button @click="handleLogout" class="btn btn-outline-danger btn-sm">
          <i class="fa-solid fa-right-from-bracket me-1"></i>
          Salir
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuth } from '../composables/useAuth';
import { useRouter } from 'vue-router';

const { userInfo, logout } = useAuth();
const router = useRouter();

// Estado reactivo para el menú de configuración
const showConfig = ref(false);

// Avatar del usuario basado en el email
const userAvatar = computed(() => {
  const email = userInfo.value.email || 'usuario@ejemplo.com';
  const name = userInfo.value.name || 'Usuario';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=23272b&color=fff&size=32`;
});

const handleLogout = () => {
  logout();
  router.push('/login');
};
</script>
