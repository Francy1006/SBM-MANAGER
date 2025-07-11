import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import FranchiseView from '../views/FranchiseView.vue';
import CatalogsView from '../views/CatalogsView.vue';
import FiscalDirective from '../views/Configuration/FiscalDirective.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: HomeView },
  { path: '/franquicias', name: 'Franquicias', component: FranchiseView },
  { path: '/catalogos', name: 'Catalogos', component: CatalogsView },
  { path: '/configuracion/directiva-fiscal', name: 'FiscalDirective', component: FiscalDirective },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router; 