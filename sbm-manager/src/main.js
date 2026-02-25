import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style/main-style.css';
import './assets/style/animations.css';
import './assets/style/status-pills.css'
import { useAuth } from './composables/useAuth';

if (!window.location.hash && window.location.pathname !== '/') {
  window.location.replace('/#' + window.location.pathname + window.location.search);
}

const app = createApp(App);
app.use(router);

const { checkAuthStatus } = useAuth();
checkAuthStatus();

app.mount('#app');