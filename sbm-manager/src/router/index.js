import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FranchiseView from '../views/FranchiseView.vue';
import CatalogsView from '../views/CatalogsView.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: HomeView },
  { path: '/franquicias', name: 'Franquicias', component: FranchiseView },
  { path: '/catalogos', name: 'Catalogos', component: CatalogsView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 