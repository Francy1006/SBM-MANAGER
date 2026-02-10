<template>
  <div class="google-login-container">
    <!-- Estado de carga -->
    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary" role="status"></div>
      <p class="mt-2 text-muted">Inicializando Google Sign-In...</p>
    </div>

    <!-- Login -->
    <div v-else-if="!isLoggedIn" class="text-center">
      <div class="mb-4">
        <h3 class="text-primary mb-3">Iniciar Sesión</h3>
        <p class="text-muted">Usa tu cuenta de Google para acceder</p>
      </div>

      <div id="google-signin-button" class="d-flex justify-content-center mb-3"></div>

      <div v-if="shouldShowFallbackButton" class="text-center mt-3">
        <a href="#" @click.prevent="handleManualLogin" class="text-primary text-decoration-none">
          <i class="fas fa-exclamation-triangle me-1"></i>
          ¿No aparece el botón de Google? Haz clic aquí para iniciar sesión
        </a>
      </div>

      <div v-if="error" class="alert alert-danger mt-3" role="alert">
        <i class="fas fa-exclamation-triangle me-2"></i>
        {{ error }}
      </div>
    </div>

    <!-- Usuario logueado -->
    <div v-else class="text-center">
      <div class="card border-0 shadow-sm">
        <div class="card-body p-4">
          <div class="mb-3">
            <i class="fas fa-user-circle text-primary fs-1"></i>
          </div>
          <h4 class="text-primary mb-2">¡Bienvenido!</h4>
          <p class="text-muted mb-3">{{ userInfo.name }}</p>
          <p class="text-muted small mb-3">{{ userInfo.email }}</p>

          <div class="d-flex justify-content-center gap-2">
            <button @click="logout" class="btn btn-outline-danger btn-sm">
              <i class="fas fa-sign-out-alt me-2"></i>
              Cerrar Sesión
            </button>
            <button @click="refreshUserInfo" class="btn btn-outline-primary btn-sm">
              <i class="fas fa-sync-alt me-2"></i>
              Actualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch, computed } from 'vue';
import axios from '../api/axios';

// Desactivar Google Auth en desarrollo automáticamente
const isDev = process.env.NODE_ENV === 'development';

// Definir emits
const emit = defineEmits(['login-success']);

// Estado reactivo
const loading = ref(true);
const isLoggedIn = ref(false);
const error = ref('');
const userInfo = ref({
  uuid: '',
  email: '',
  name: '',
  token: ''
});

// Referencia al token de Google
let googleTokenClient = null;
let googleUser = null;

// Configuración de Google
const GOOGLE_CLIENT_ID = '815958124165-c4jtlvju3ngm68ecpgqf3k208tqd984f.apps.googleusercontent.com';
const BACKEND_URL = 'http://localhost:8082/api/users/auth/google/';

// Variable para controlar si mostrar el botón de fallback
const shouldShowFallbackButton = ref(false);

// Función para cargar Google Identity Services
const loadGoogleIdentityServices = () => {
  return new Promise((resolve, reject) => {
    // Verificar si ya está cargado
    if (window.google && window.google.accounts) {
      resolve();
      return;
    }

    // Cargar desde CDN
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google && window.google.accounts) {
        resolve();
      } else {
        reject(new Error('Google Identity Services no se cargó correctamente'));
      }
    };
    
    script.onerror = () => {
      reject(new Error('Error al cargar Google Identity Services'));
    };
    
    document.head.appendChild(script);
  });
};

// Función para inicializar Google Sign-In
const initializeGoogleSignIn = async () => {
  try {
    console.log('Iniciando Google Sign-In...');
    await loadGoogleIdentityServices();
    
    console.log('Google Identity Services cargado, configurando...');
    
    // Función para esperar y encontrar el contenedor del botón
    const waitForButtonContainer = async (maxAttempts = 10) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          console.log(`Contenedor del botón encontrado en intento ${attempt}`);
          return buttonContainer;
        }
        
        console.log(`Intento ${attempt}: Contenedor del botón no encontrado, esperando...`);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      throw new Error('Contenedor del botón no encontrado después de múltiples intentos');
    };
    
    // Esperar a que el DOM esté listo y encontrar el contenedor
    await nextTick();
    const buttonContainer = await waitForButtonContainer();
    
    // Renderizar el botón
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleSignIn,
      auto_select: false,
      cancel_on_tap_outside: true
    });
    
    console.log('Renderizando botón de Google...');
    window.google.accounts.id.renderButton(
      buttonContainer,
      {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: 300
      }
    );
    
    // Limpiar botón de fallback si existe
    shouldShowFallbackButton.value = false;
    
    console.log('Botón de Google renderizado exitosamente');
    loading.value = false;
    
    // Verificar si el botón de Google se renderizó correctamente
    const googleButton = document.querySelector('#google-signin-button button');
    if (googleButton) {
      console.log('Botón de Google detectado, no se mostrará fallback');
      shouldShowFallbackButton.value = false;
    } else {
      // Mostrar enlace de fallback después de 1 segundo si Google no se carga
      setTimeout(() => {
        const googleButtonRetry = document.querySelector('#google-signin-button button');
        if (!googleButtonRetry && !isLoggedIn.value) {
          shouldShowFallbackButton.value = true;
          console.log('Mostrando enlace de fallback');
        }
      }, 1000);
    }
    
  } catch (err) {
    console.error('Error al inicializar Google Sign-In:', err);
    error.value = `Error al cargar Google Sign-In: ${err.message}. Usando enlace de fallback.`;
    loading.value = false;
    shouldShowFallbackButton.value = true;
  }
};

// Función para manejar el login de Google
const handleGoogleSignIn = async (response) => {
  try {
    loading.value = true;
    error.value = '';
    
    console.log('Google Sign-In response:', response);
    
    // El response.credential es el JWT token de Google
    const credential = response.credential;
    
    // Decodificar el JWT para obtener información del usuario
    const payload = JSON.parse(atob(credential.split('.')[1]));
    console.log('JWT payload:', payload);
    
    // Enviar al backend
    const backendResponse = await axios.post(BACKEND_URL, {
      id_token: credential
    });
    
    console.log('Backend response:', backendResponse.data);
    
    // Guardar en localStorage
    const userData = backendResponse.data;
    localStorage.setItem('uuid', userData.uuid);
    localStorage.setItem('email', userData.email);
    localStorage.setItem('name', userData.name);
    localStorage.setItem('token', userData.token);
    
    // Actualizar estado
    userInfo.value = {
      uuid: userData.uuid,
      email: userData.email,
      name: userData.name,
      token: userData.token
    };
    
    isLoggedIn.value = true;
    loading.value = false;
    shouldShowFallbackButton.value = false; // Ocultar botón de fallback si existe
    
    console.log('Login exitoso:', userInfo.value);
    
    // Emitir evento de login exitoso
    emit('login-success', userInfo.value);
    
  } catch (err) {
    console.error('Error en login:', err);
    console.error('Error details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      statusText: err.response?.statusText
    });
    
    let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
    
    if (err.response?.status === 404) {
      errorMessage = 'Endpoint no encontrado. Verifica la URL del backend.';
    } else if (err.response?.status === 400) {
      errorMessage = 'Datos inválidos enviados al servidor.';
    } else if (err.response?.status === 500) {
      errorMessage = 'Error interno del servidor.';
    } else if (err.response?.data?.detail) {
      errorMessage = err.response.data.detail;
    } else if (err.message) {
      errorMessage = `Error de conexión: ${err.message}`;
    }
    
    error.value = errorMessage;
    loading.value = false;
  }
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
  
  isLoggedIn.value = false;
  shouldShowFallbackButton.value = false; // Limpiar botón de fallback
  
  // Cerrar sesión de Google
  if (window.google && window.google.accounts) {
    window.google.accounts.id.disableAutoSelect();
  }
  
  console.log('Sesión cerrada');
};

// Función para el botón de fallback
const handleManualLogin = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    console.log('Login manual iniciado');
    
    // Simular datos de usuario para testing
    const mockUserData = {
      uuid: '5fbf2886-4ad0-11f0-8ce6-0242ac120002',
      email: 'fra.sotmen@gmail.com',
      name: 'FRANCISCO',
      token: 'mock-token-123'
    };
    
    // Guardar en localStorage
    localStorage.setItem('uuid', mockUserData.uuid);
    localStorage.setItem('email', mockUserData.email);
    localStorage.setItem('name', mockUserData.name);
    localStorage.setItem('token', mockUserData.token);
    
    // Actualizar estado
    userInfo.value = mockUserData;
    isLoggedIn.value = true;
    loading.value = false;
    shouldShowFallbackButton.value = false; // Ocultar botón de fallback si existe
    
    console.log('Login manual exitoso:', userInfo.value);
    
    // Emitir evento de login exitoso
    emit('login-success', userInfo.value);
    
  } catch (err) {
    console.error('Error en login manual:', err);
    error.value = 'Error en login manual. Por favor, intenta de nuevo.';
    loading.value = false;
  }
};

// Función para refrescar información del usuario
const refreshUserInfo = () => {
  const storedUserInfo = {
    uuid: localStorage.getItem('uuid'),
    email: localStorage.getItem('email'),
    name: localStorage.getItem('name'),
    token: localStorage.getItem('token')
  };
  
  if (storedUserInfo.uuid && storedUserInfo.email && storedUserInfo.name && storedUserInfo.token) {
    userInfo.value = storedUserInfo;
    isLoggedIn.value = true;
  } else {
    logout();
  }
};

// Verificar si ya está logueado al montar
const checkLoginStatus = async () => {
  const storedUserInfo = {
    uuid: localStorage.getItem('uuid'),
    email: localStorage.getItem('email'),
    name: localStorage.getItem('name'),
    token: localStorage.getItem('token')
  };
  
  if (storedUserInfo.uuid && storedUserInfo.email && storedUserInfo.name && storedUserInfo.token) {
    userInfo.value = storedUserInfo;
    isLoggedIn.value = true;
    loading.value = false;
  } else {
    // Marcar como no logueado e inicializar Google Sign-In
    isLoggedIn.value = false;
    loading.value = false;
    
    // Inicializar Google Sign-In después de que el DOM esté listo
    await nextTick();
    setTimeout(async () => {
      await initializeGoogleSignIn();
    }, 100);
  }
};

// Watcher para reinicializar cuando el usuario cierre sesión
watch(isLoggedIn, async (newValue, oldValue) => {
  if (oldValue === true && newValue === false) {
    // Usuario cerró sesión, reinicializar Google Sign-In
    await nextTick();
    setTimeout(async () => {
      await initializeGoogleSignIn();
    }, 100);
  }
});

// Lifecycle hooks
onMounted(() => {
  if (isDev) {
    // En desarrollo, simular login automático
    handleManualLogin();
  } else {
    checkLoginStatus();
  }
});

onUnmounted(() => {
  // Limpiar recursos si es necesario
  if (googleTokenClient) {
    googleTokenClient = null;
  }
});
</script>