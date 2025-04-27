<template>
  <div class="home-container">
    <h1 class="title">🏠 홈 화면</h1>
    <div class="grid-layout">
      <!-- 1. 프로필 박스 -->
      <div class="box profile-box">
        <h2>프로필</h2>
        <p>사용자 이름 : 김성재</p>
        <p>역할 : 관리자</p>
        <p>이메일 : 1@1</p>
      </div>

      <!-- 2. 카메라 박스 -->
      <div class="box camera-box">
        <h2>카메라</h2>
        <div v-if="cameraBaseUrl">
          <div v-if="isCameraLoading" class="loading-text">
            카메라 로딩 중...
          </div>
          <img
            v-show="!isCameraLoading"
            :src="cameraBaseUrl"
            alt="Camera Stream"
            class="camera-stream"
            @load="handleCameraLoad"
            @error="handleCameraError"
            ref="cameraImage"
          />
          <p v-if="cameraLoadError" class="error-text">카메라 로딩 실패</p>
        </div>
        <p v-else class="no-camera">기본 카메라가 설정되지 않았습니다.</p>
      </div>

      <!-- 3. 대시보드 리스트 -->
      <div class="box dashboard-box">
        <h2>대시보드</h2>
        <ul
          class="scroll-list"
          :class="{ 'scroll-enabled': dashboardLogs.length > 5 }"
        >
          <li v-for="(log, index) in dashboardLogs" :key="index">
            [{{ log.email }}] {{ formatLoginTime(log.login_time) }} - 로그인
            시도 ({{ log.success ? 'O' : 'X' }})
          </li>
        </ul>
      </div>

      <!-- 4. 알림 리스트 -->
      <div class="box alert-box">
        <h2>알림</h2>
        <ul class="scroll-list">
          <li v-for="i in 10" :key="i">알림 {{ i }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';

const cameraBaseUrl = ref('');
const isCameraLoading = ref(true);
const cameraLoadError = ref(false);
const dashboardLogs = ref([]);
let cameraImage = null;

const fetchDashboardLogs = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/auth/login-logs',
    );
    dashboardLogs.value = response.data.slice(0, 10); // 최근 10개만
  } catch (error) {
    console.error('대시보드 데이터 불러오기 실패:', error);
  }
};

onMounted(() => {
  // 카메라 기본 주소 로드
  const savedCameraUrl = localStorage.getItem('cameraBaseUrl');
  if (savedCameraUrl) {
    cameraBaseUrl.value = savedCameraUrl;
  }

  // 대시보드 로그 불러오기
  fetchDashboardLogs();
});

const handleCameraLoad = () => {
  isCameraLoading.value = false;
};

const handleCameraError = () => {
  isCameraLoading.value = false;
  cameraLoadError.value = true;
};

onBeforeUnmount(() => {
  if (cameraImage) {
    cameraImage.onload = null;
    cameraImage.onerror = null;
  }
});

const formatLoginTime = (timeString) => {
  const date = new Date(timeString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} / ${hh}:${min}:${ss}`;
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
}

.grid-layout {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 20px;
}

.box {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 20px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.camera-stream {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  object-fit: cover;
}

.no-camera {
  color: #718096;
  font-style: italic;
}

.scroll-list {
  max-height: 160px;
  overflow-y: auto;
  padding-left: 20px;
  list-style: disc;
}

.scroll-list li {
  margin-bottom: 8px;
}

.scroll-enabled {
  overflow-y: scroll;
}

.loading-text {
  text-align: center;
  color: #718096;
  margin-top: 20px;
}

.error-text {
  text-align: center;
  color: #e53e3e;
  margin-top: 20px;
}
</style>
