import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/style/main-style.css';
import './assets/style/animations.css';

const app = createApp(App);
app.use(router);
app.mount('#app'); 