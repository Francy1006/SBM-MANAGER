import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style/main-style.css';
import './assets/style/animations.css';
import { useAuth } from './composables/useAuth';

const app = createApp(App);
app.use(router);

// Inicializar estado de autenticación
const { checkAuthStatus } = useAuth();
checkAuthStatus();

app.mount('#app'); 