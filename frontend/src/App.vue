<template>
  <div id="app">
    <!-- 로그인 상태에 따라 메뉴 표시/숨기기 -->
    <div v-if="!isLoggedIn">
      <LoginView @login-success="handleLoginSuccess" />
      <!-- 로그인 화면만 표시 -->
    </div>
    <div v-else>
      <!-- 로그인 후에는 상단 메뉴와 로그아웃 버튼 표시 -->
      <nav class="navbar">
        <router-link to="/camera" class="nav-item">카메라</router-link>
        <router-link to="/dashboard" class="nav-item">대시보드</router-link>
        <router-link to="/alerts" class="nav-item">알림</router-link>
        <router-link to="/settings" class="nav-item">설정</router-link>
        <button @click="logout" class="logout-btn">로그아웃</button>
      </nav>
      <router-view />
      <!-- 메뉴가 있는 페이지 -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import LoginView from './components/LoginView.vue'; // 로그인 컴포넌트
import { useRouter } from 'vue-router';

const isLoggedIn = ref(false);
const router = useRouter();

// 로그인 상태 확인
onMounted(() => {
  const storedLoginStatus = localStorage.getItem('isLoggedIn');
  if (storedLoginStatus === 'true') {
    isLoggedIn.value = true;
  }
});

// 로그인 성공 시 처리
const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  localStorage.setItem('isLoggedIn', 'true');
  router.push('/camera'); // 로그인 후 카메라 페이지로 이동
};

// 로그아웃 처리
const logout = () => {
  isLoggedIn.value = false;
  localStorage.removeItem('isLoggedIn'); // 로그인 상태 해제
  router.push('/'); // 로그인 화면으로 이동
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
