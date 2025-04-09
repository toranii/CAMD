import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../components/LoginView.vue';
import HomepageView from '../components/HomepageView.vue';
import CameraView from '../components/CameraView.vue';
import DashboardView from '../components/DashBoardView.vue';
import AlertView from '../components/AlertView.vue';
import SettingsView from '../components/SettingsView.vue'; // 설정 페이지 임포트

const routes = [
  { path: '/', component: LoginView }, // 로그인 페이지를 메인으로 설정
  { path: '/home', component: HomepageView },
  { path: '/camera', component: CameraView },
  { path: '/dashboard', component: DashboardView },
  { path: '/alerts', component: AlertView },
  { path: '/settings', component: SettingsView }, // 설정 페이지 라우팅 추가
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
