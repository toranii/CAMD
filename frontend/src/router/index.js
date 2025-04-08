import { createRouter, createWebHistory } from 'vue-router';
import CameraView from '../components/CameraView.vue';
import LoginView from '../components/LoginView.vue';
import AlertView from '../components/AlertView.vue';
import DashboardView from '../components/DashBoardView.vue';

const routes = [
  { path: '/', component: LoginView }, // 로그인 페이지를 메인으로 설정
  { path: '/camera', component: CameraView },
  { path: '/login', component: LoginView },
  { path: '/alerts', component: AlertView },
  { path: '/dashboard', component: DashboardView },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
