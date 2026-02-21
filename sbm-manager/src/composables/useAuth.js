import { ref, computed } from 'vue';

// Estado global de autenticación
const isAuthenticated = ref(false);
const userInfo = ref({
  uuid: '',
  email: '',
  name: '',
  token: ''
});

// Función para verificar si el usuario está autenticado
const checkAuthStatus = () => {
  const storedUserInfo = {
    uuid: localStorage.getItem('uuid'),
    email: localStorage.getItem('email'),
    name: localStorage.getItem('name'),
    token: localStorage.getItem('token')
  };
  
  if (storedUserInfo.uuid && storedUserInfo.email && storedUserInfo.name && storedUserInfo.token) {
    userInfo.value = storedUserInfo;
    isAuthenticated.value = true;
    return true;
  } else {
    // Limpiar estado si no hay datos válidos
    userInfo.value = {
      uuid: '',
      email: '',
      name: '',
      token: ''
    };
    isAuthenticated.value = false;
    return false;
  }
};

// Función para establecer el usuario autenticado
const setAuthenticatedUser = (userData) => {
  userInfo.value = userData;
  isAuthenticated.value = true;
  
  // Guardar en localStorage
  localStorage.setItem('uuid', userData.uuid);
  localStorage.setItem('email', userData.email);
  localStorage.setItem('name', userData.name);
  localStorage.setItem('token', userData.token);
};

// Función para cerrar sesión
const logout = () => {
  // Limpiar localStorage
  localStorage.removeItem('uuid');
  localStorage.removeItem('email');
  localStorage.removeItem('name');
  localStorage.removeItem('token');
  
  // Limpiar estado
  userInfo.value = {
    uuid: '',
    email: '',
    name: '',
    token: ''
  };
  isAuthenticated.value = false;
};

// Función para proteger rutas
const requireAuth = (to, from, next) => {
  const isAuth = checkAuthStatus();
  
  if (!isAuth) {
    // Redirigir al login si no está autenticado
    next('/login');
  } else {
    // Permitir acceso si está autenticado
    next();
  }
};

// Función para redirigir si ya está autenticado
const redirectIfAuthenticated = (to, from, next) => {
  const isAuth = checkAuthStatus();
  
  if (isAuth) {
    // Redirigir al home si ya está autenticado
    next('/');
  } else {
    // Permitir acceso al login
    next();
  }
};

export function useAuth() {
  
  return {
    // Estado
    isAuthenticated: computed(() => isAuthenticated.value),
    userInfo: computed(() => userInfo.value),
    
    // Funciones
    checkAuthStatus,
    setAuthenticatedUser,
    logout,
    requireAuth,
    redirectIfAuthenticated
  };
} 