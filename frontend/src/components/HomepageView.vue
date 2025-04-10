<template>
  <div class="home-container">
    <h1 class="title">🏠 홈 화면</h1>
    <div class="grid-layout">
      <!-- 1. 프로필 박스 -->
      <div class="box profile-box">
        <h2>프로필</h2>
        <p>사용자 이름: 김현수</p>
        <p>역할: 관리자</p>
        <p>이메일: Raustn@CAMD_.git</p>
      </div>

      <!-- 2. 카메라 박스 -->
      <div class="box camera-box">
        <h2>카메라</h2>
        <img
          v-if="cameraBaseUrl"
          :src="cameraBaseUrl"
          alt="Camera Stream"
          class="camera-stream"
        />
        <p v-else class="no-camera">기본 카메라가 설정되지 않았습니다.</p>
      </div>

      <!-- 3. 대시보드 리스트 -->
      <div class="box dashboard-box">
        <h2>대시보드</h2>
        <ul class="scroll-list">
          <li v-for="i in 10" :key="i">대시보드 항목 {{ i }}</li>
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
import { ref, onMounted } from 'vue';

const cameraBaseUrl = ref('');

onMounted(() => {
  const savedCameraUrl = localStorage.getItem('cameraBaseUrl');
  if (savedCameraUrl) {
    cameraBaseUrl.value = savedCameraUrl;
  }
});
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
</style>
