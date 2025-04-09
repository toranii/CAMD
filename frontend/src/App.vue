<template>
  <div id="app">
    <!-- 로그인 상태에 따라 메뉴 표시/숨기기 -->
    <div v-if="isLoginPage">
      <LoginView @login-success="handleLoginSuccess" />
    </div>
    <div v-else>
      <!-- 로그인 후에는 상단 메뉴와 로그아웃 버튼 표시 -->
      <nav class="navbar">
        <router-link to="/home" class="nav-item">홈</router-link>
        <router-link to="/camera" class="nav-item">카메라</router-link>
        <router-link to="/dashboard" class="nav-item">대시보드</router-link>
        <router-link to="/alerts" class="nav-item">알림</router-link>
        <router-link to="/settings" class="nav-item">설정</router-link>
        <button @click="logout" class="logout-btn">로그아웃</button>
      </nav>
      <router-view />
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

// 로그인 상태 확인
onMounted(() => {
  const storedLoginStatus = localStorage.getItem('isLoggedIn');
  isLoggedIn.value = storedLoginStatus === 'true';
  updateLoginPageStatus(route.path);

  // ✅ 로그인 상태일 때 로그인 경로로 접근하면 홈 페이지로 강제 이동
  if (isLoggedIn.value && (route.path === '/' || route.path === '/login')) {
    router.replace('/home');
  }
});

// 라우트 변경 시 로그인 페이지 여부 확인 및 리다이렉션
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

// 로그인 성공 시 처리
const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  localStorage.setItem('isLoggedIn', 'true');
  router.push('/home');
};

// 로그아웃 처리
const logout = () => {
  isLoggedIn.value = false;
  localStorage.removeItem('isLoggedIn');
  router.push('/');
};
</script>

<style scoped>
/* 네비게이션 바 스타일 */
.navbar {
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #2d3748;
  padding: 10px 0;
  border-radius: 8px;
  margin: 20px 0;
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
</style>
