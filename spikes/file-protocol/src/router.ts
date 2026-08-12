import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardPage from './views/DashboardPage.vue';
import OrdersPage from './views/OrdersPage.vue';
import SettingsPage from './views/SettingsPage.vue';

export const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/dashboard', name: 'dashboard', component: DashboardPage },
  { path: '/orders', name: 'orders', component: OrdersPage },
  { path: '/settings', name: 'settings', component: SettingsPage }
];

export const router = createRouter({ history: createWebHashHistory(), routes });
