<template>
  <div id="app" class="app-layout">
    <div v-if="isLoginPage">
      <LoginView @login-success="handleLoginSuccess" />
    </div>
    <div v-else class="main-layout">
      <aside class="sidebar">
        <div class="sidebar-header">CamStone</div>

        <!-- ✅ 프로필 정보 추가 -->
        <div class="profile-info">
          <p><strong>이름:</strong> 김수재</p>
          <p><strong>접속 IP:</strong> 127.0.0.1</p>
          <p><strong>이메일:</strong> 1@1</p>
          <p><strong>등록 카메라:</strong> {{ cameraCount }}대</p>
        </div>
        <div class="sidebar-separator"></div>

        <!-- 메뉴 -->
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
const cameraCount = ref(2); // ✅ 등록된 카메라 대수 (임시 2대)

const router = useRouter();
const route = useRoute();

const checkLoginStatus = () => {
  const token = localStorage.getItem('token');
  isLoggedIn.value = !!token;
};

onMounted(() => {
  checkLoginStatus();
  updateLoginPageStatus(route.path);

  if (!isLoggedIn.value && route.path !== '/' && route.path !== '/login') {
    router.replace('/login');
  }
});

watch(
  () => route.path,
  (newPath) => {
    updateLoginPageStatus(newPath);
  },
);

const updateLoginPageStatus = (path) => {
  isLoginPage.value = path === '/' || path === '/login';
};

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  router.push('/home');
};

const logout = () => {
  isLoggedIn.value = false;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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
  height: 1px;
  background: linear-gradient(to right, #4fd1c5, #38b2ac);
  border-radius: 1px;
}

/* ✅ 프로필 정보 스타일 */
.profile-info {
  background-color: #1a202c;
  border: 1px solid #4a5568;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  color: #edf2f7;
  font-size: 0.9rem;
}

.profile-info p {
  margin: 4px 0;
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
  background: linear-gradient(to right, #4fd1c5, #38b2ac);
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
