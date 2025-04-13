<template>
  <div id="app" class="app-layout">
    <div v-if="isLoginPage">
      <LoginView @login-success="handleLoginSuccess" />
    </div>
    <div v-else class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          CamStone
          <div class="sidebar-header-bg"></div>
        </div>
        <router-link
          to="/home"
          class="nav-item"
          active-class="router-link-active"
          >홈</router-link
        >
        <router-link
          to="/camera"
          class="nav-item"
          active-class="router-link-active"
          >카메라</router-link
        >
        <router-link
          to="/dashboard"
          class="nav-item"
          active-class="router-link-active"
          >대시보드</router-link
        >
        <router-link
          to="/alerts"
          class="nav-item"
          active-class="router-link-active"
          >알림</router-link
        >
        <router-link
          to="/settings"
          class="nav-item"
          active-class="router-link-active"
          >설정</router-link
        >
        <div class="sidebar-separator"></div>
        <button @click="logout" class="logout-btn">로그아웃</button>
      </aside>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import LoginView from './components/LoginView.vue';
import { useRouter, useRoute } from 'vue-router';

const isLoggedIn = ref(false);
const isLoginPage = ref(true);

const router = useRouter();
const route = useRoute();

// ✅ 로그인 상태는 token 유무로 판단
const token = localStorage.getItem('token');
isLoggedIn.value = !!token;

onMounted(() => {
  updateLoginPageStatus(route.path);

  if (isLoggedIn.value && (route.path === '/' || route.path === '/login')) {
    router.replace('/home');
  }
});

watch(
  () => route.path,
  (newPath) => {
    updateLoginPageStatus(newPath);

    if (isLoggedIn.value && (newPath === '/' || newPath === '/login')) {
      router.replace('/home');
    }
  },
);

const updateLoginPageStatus = (path) => {
  isLoginPage.value = path === '/' || path === '/login';
};

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  // ✅ isLoggedIn 저장 불필요, token이 저장되었는지로 판단
  router.push('/home');
};

const logout = () => {
  isLoggedIn.value = false;

  // ✅ 로그인 정보 제거
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // 로그인 페이지로 이동
  router.push('/login');
};
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 240px;
  background-color: #2d3748;
  display: flex;
  flex-direction: column;
  padding: 20px 15px;
  gap: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.sidebar-header {
  position: relative;
  font-size: 1.3rem;
  font-weight: bold;
  color: #ffffff;
  text-align: center;
  margin-bottom: 20px;
  padding: 10px 0;
}

.sidebar-header-bg {
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #4fd1c5, #38b2ac);
  border-radius: 2px;
}

.nav-item {
  color: #edf2f7;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  padding: 10px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background-color: #38b2ac;
  color: #fff;
  transform: scale(1.05);
}

.router-link-active {
  background-color: #4fd1c5;
  color: white;
  font-weight: bold;
}

.sidebar-separator {
  height: 1px;
  background-color: #4a5568;
  margin: 15px 0;
}

.logout-btn {
  background-color: #e53e3e;
  color: white;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.logout-btn:hover {
  background-color: #c53030;
  transform: scale(1.05);
}

.content {
  flex: 1;
  padding: 20px;
  margin-left: 240px;
  overflow-y: auto;
  min-height: 100vh;
}
</style>
