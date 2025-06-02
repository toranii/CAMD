<template>
  <div id="app" class="app-layout">
    <!-- 🔒 토큰 체크 중일 때 -->
    <div
      v-if="isCheckingToken"
      class="flex justify-center items-center h-screen text-xl"
    >
      🔐 로그인 상태 확인 중...
    </div>
    <!-- ✅ 토큰 체크 끝나면 렌더링 -->
    <div v-else>
      <div v-if="isLoginPage || isSignupPage">
        <LoginView v-if="isLoginPage" @login-success="handleLoginSuccess" />
        <router-view v-else />
      </div>
      <div v-else class="main-layout">
        <aside class="sidebar">
          <div class="sidebar-header">CamStone</div>

          <!-- ✅ 프로필 정보 -->
          <div class="profile-info">
            <p><strong>이름:</strong> {{ userInfo.name }}</p>
            <p><strong>접속 IP:</strong> {{ clientIp }}</p>
            <p><strong>이메일:</strong> {{ userInfo.email }}</p>
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import LoginView from './components/LoginView.vue';
import Swal from 'sweetalert2';
import axios from 'axios';

const isLoggedIn = ref(false);
const isLoginPage = ref(true);
const isSignupPage = ref(false);
const userInfo = ref({});
const cameraCount = ref(0);
const clientIp = ref(''); // 클라이언트 IP 주소
const isCheckingToken = ref(true); // 새로고침 시 토큰 체크
const user = JSON.parse(localStorage.getItem('user') || '{}');

const router = useRouter();
const route = useRoute();
//const user = ref(JSON.parse(localStorage.getItem('user') || '{}'));

// ✅ 로그인/회원가입 페이지 구분
const updateSignPageStatus = (path) => {
  isLoginPage.value = path === '/' || path === '/login';
  isSignupPage.value = path === '/signup';
};

// ✅ 로그인 성공 시 처리
const handleLoginSuccess = async () => {
  localStorage.setItem('token', 'dummy_token'); // 토큰 저장
  isLoggedIn.value = true;
  await router.push('/home');
};

async function fetchUserInfo() {
  try {
    const res = await axios.get(`http://203.234.19.95:23918/users/${user.id}`);
    userInfo.value = res.data;
  } catch (err) {
    console.error('사용자 정보 불러오기 실패:', err);
  }
}

async function fetchCameraCount() {
  try {
    const res = await axios.get('http://203.234.19.95:23918/api/device/list');
    if (res.data.success) {
      // 전체 등록된 장치 개수 반환
      cameraCount.value = res.data.devices.length;
    }
  } catch (err) {
    console.error('카메라 개수 불러오기 실패:', err);
  }
}

async function fetchClientIp() {
  try {
    const { data } = await axios.get('https://api64.ipify.org?format=json');
    clientIp.value = data.ip;
  } catch (err) {
    console.error('IP 조회 실패:', err);
  }
}

// ✅ 로그아웃
const logout = () => {
  Swal.fire({
    title: '로그아웃 하시겠습니까?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6', // 예 버튼 색상
    cancelButtonColor: '#d33', // 아니오 버튼 색상
    confirmButtonText: '예',
    cancelButtonText: '아니오',
  }).then((result) => {
    if (result.isConfirmed) {
      isLoggedIn.value = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    }
  });
};

// ✅ 최초 로딩 시 처리
onMounted(async () => {
  const token = localStorage.getItem('token');
  fetchUserInfo();
  fetchCameraCount();
  fetchClientIp();

  if (token) {
    try {
      await axios.post('http://203.234.19.95:23918/api/auth/verify_token', {
        token,
      });
      isLoggedIn.value = true;
    } catch (err) {
      isLoggedIn.value = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.replace('/login');
    }
  } else {
    isLoggedIn.value = false;
    if (!['/', '/login', '/signup'].includes(route.path)) {
      router.replace('/login');
    }
  }

  updateSignPageStatus(route.path);
  isCheckingToken.value = false; // ✅ 로딩 끝
});

// ✅ 경로 변경 감시
watch(
  () => route.path,
  async (newPath) => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        await axios.post('http://203.234.19.95:23918/api/auth/verify_token', {
          token,
        });
        isLoggedIn.value = true;
      } catch (err) {
        isLoggedIn.value = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.replace('/login');
      }
    } else {
      isLoggedIn.value = false;
      if (!['/', '/login', '/signup'].includes(newPath)) {
        router.replace('/login');
      }
    }

    updateSignPageStatus(newPath);
  },
);
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
