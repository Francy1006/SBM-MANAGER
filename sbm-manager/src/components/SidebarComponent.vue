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
          <span class="nav-text">Franquicias</span>
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
          <i class="fa-solid fa-box"></i>
          <span class="nav-text">Productos</span>
        </router-link>
      </li>
      <li>
        <router-link to="/materiales" class="nav-link" active-class="active">
          <i class="fa-solid fa-tools"></i>
          <span class="nav-text">Materiales</span>
        </router-link>
      </li>
      <li>
        <router-link to="/servicios" class="nav-link" active-class="active">
          <i class="fa-solid fa-cogs"></i>
          <span class="nav-text">Servicios</span>
        </router-link>
      </li>
      <li>
        <router-link to="/proveedores" class="nav-link" active-class="active">
          <i class="fa-solid fa-truck"></i>
          <span class="nav-text">Proveedores</span>
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

<style scoped>
.sidebar {
  width: 240px;
  height: 100vh;
  position: relative;
  top: 0;
  left: 0;
  background: #ffffff; /* fondo claro */
  color: #212529;       /* texto oscuro */
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  box-shadow: 2px 0 8px #0002;
  font-family: Arial, sans-serif;
}
.brand {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  text-decoration: none;
  color: #e53935; /* rojo */
  font-size: 1.4rem;
  font-weight: bold;
}
.brand i {
  margin-right: 0.5rem;
}
.nav {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
  display: block !important; /* Fuerza columna, ignora display:flex de Bootstrap */
}
.nav li {
  margin-bottom: 0.25rem;
}
.nav-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  color: #212529; /* texto oscuro */
  opacity: 0.85;
  transition: background 0.3s, opacity 0.3s, color 0.3s;
  font-family: 'DINAlternate', Arial, sans-serif;
  font-weight: bold;
}
.nav-link i {
  margin-right: 0.75rem;
  font-family: 'Font Awesome 6 Free' !important;
  font-weight: 900 !important;
}
.nav-link:hover {
  background: #f5f5f5; /* hover claro */
  opacity: 1;
  color: #e53935;     /* rojo al pasar */
}
.active {
  background: #e53935 !important; /* fondo activo rojo */
  color: #ffffff !important;      /* texto claro */
  opacity: 1;
}
.user {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}
.user-info img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 0.75rem;
  border: 1px solid #dee2e6;
}
.user-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.user-name {
  font-weight: bold;
  font-size: 0.9rem;
  color: #212529;
  line-height: 1.2;
}
.user-email {
  font-size: 0.75rem;
  color: #6c757d;
  line-height: 1.2;
  word-break: break-word;
}
.user-actions {
  display: flex;
  justify-content: center;
}
.user-actions .btn {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
    padding: 1rem 0.5rem;
  }
  
  .brand {
    font-size: 1.2rem;
    margin-bottom: 1rem;
  }
  
  .nav-link {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }
  
  .nav-link i {
    margin-right: 0.5rem;
    font-size: 0.9rem;
  }
  
  .user {
    padding-top: 0.5rem;
  }
  
  .user-info img {
    width: 28px;
    height: 28px;
  }
  
  .user-name {
    font-size: 0.85rem;
  }
  
  .user-email {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .sidebar {
    padding: 0.75rem 0.25rem;
  }
  
  .brand {
    font-size: 1.1rem;
  }
  
  .nav-link {
    padding: 0.5rem 0.25rem;
    font-size: 0.85rem;
  }
  
  .nav-link i {
    margin-right: 0.25rem;
    font-size: 0.85rem;
  }
  
  .user-text, .nav-text {
    font-size: 0.85rem;
  }
  
  .user-name {
    font-size: 0.8rem;
  }
  
  .user-email {
    font-size: 0.65rem;
  }
}

/* Forzar ocultamiento de submenús anidados en el sidebar */
.nav.flex-column[style*="display: none"] {
  display: none !important;
}

.sidebar-sublink {
  margin-left: 18px;
  font-size: 0.97em;
  opacity: 0.95;
}
</style>

