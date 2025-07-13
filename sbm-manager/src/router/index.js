import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FranchiseView from '../views/FranchiseView.vue';
import CatalogsView from '../views/CatalogsView.vue';
import FiscalDirective from '../views/Configuration/FiscalDirective.vue';
import LoginView from '../views/LoginView.vue';
import { useAuth } from '../composables/useAuth';

const routes = [
  { 
    path: '/', 
    name: 'Dashboard', 
    component: HomeView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: LoginView,
    meta: { requiresAuth: false }
  },
  { 
    path: '/franquicias', 
    name: 'Franquicias', 
    component: FranchiseView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/catalogos', 
    name: 'Catalogos', 
    component: CatalogsView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/configuracion/directiva-fiscal', 
    name: 'FiscalDirective', 
    component: FiscalDirective,
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guardia de navegación para proteger rutas
router.beforeEach((to, from, next) => {
  const { checkAuthStatus } = useAuth();
  
  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    const isAuthenticated = checkAuthStatus();
    
    if (!isAuthenticated) {
      // Redirigir al login si no está autenticado
      next('/login');
    } else {
      // Permitir acceso si está autenticado
      next();
    }
  } else if (to.path === '/login') {
    // Si va al login, verificar si ya está autenticado
    const isAuthenticated = checkAuthStatus();
    
    if (isAuthenticated) {
      // Redirigir al home si ya está autenticado
      next('/');
    } else {
      // Permitir acceso al login
      next();
    }
  } else {
    // Para rutas sin meta, permitir acceso
    next();
  }
});

export default router; 