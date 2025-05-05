import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../components/LoginView.vue';
import SignupForm from '../components/SignupForm.vue';
import HomepageView from '../components/HomepageView.vue';
import CameraView from '../components/CameraView.vue';
import DashboardView from '../components/DashBoardView.vue';
import AlertView from '../components/AlertView.vue';
import SettingsView from '../components/SettingsView.vue';

const routes = [
  { path: '/', component: LoginView },
  { path: '/signup', component: SignupForm },
  { path: '/home', component: HomepageView, meta: { requiresAuth: true } },
  { path: '/camera', component: CameraView, meta: { requiresAuth: true } },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
  },
  { path: '/alerts', component: AlertView, meta: { requiresAuth: true } },
  { path: '/settings', component: SettingsView, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// ✅ 로그인 안한 사용자는 /login으로 리디렉션
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthPage = to.path === '/login' || to.path === '/signup';

  // ✅ 1. 인증 페이지에 접근했는데 로그인된 경우 → 홈으로 보냄
  if (isAuthPage && token) {
    return next('/home');
  }

  // ✅ 2. 인증이 필요한 페이지인데 토큰이 없는 경우 → 로그인 페이지로
  if (to.meta.requiresAuth && !token) {
    return next('/login');
  }

  next(); // 그 외는 통과
});

export default router;
