import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FranchiseView from '../views/FranchiseView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: HomeView },
  { path: '/franquicias', name: 'Franquicias', component: FranchiseView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 