<template>
  <div class="home-container">
    <h1 class="title">🏠 홈 화면</h1>
    <div class="grid-layout">
      <!-- 1. 카메라 박스 -->
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

      <!-- 2. 대시보드 박스 -->
      <div class="box dashboard-box">
        <h2>대시보드</h2>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style="width: 40px">번호</th>
                <th style="width: 160px">시간</th>
                <th style="width: 120px">IP 주소</th>
                <th style="width: 150px">이메일</th>
                <th style="min-width: 150px">내용</th>
                <th style="width: 40px">결과</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(log, index) in latestLogs" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ formatLoginTime(log.login_time) }}</td>
                <td>{{ log.ip_address }}</td>
                <td>{{ log.email }}</td>
                <td>로그인 시도</td>
                <td
                  :class="{
                    success: log.success === 1,
                    failure: log.success !== 1,
                  }"
                >
                  {{ log.success === 1 ? 'O' : 'X' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. 알림 리스트 -->
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const cameraBaseUrl = ref('');
const logs = ref([]);

onMounted(() => {
  const savedCameraUrl = localStorage.getItem('cameraBaseUrl');
  if (savedCameraUrl) {
    cameraBaseUrl.value = savedCameraUrl;
  }

  fetchLogs();
});

const fetchLogs = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/auth/login-logs',
    );
    logs.value = response.data;
  } catch (error) {
    console.error('로그 가져오기 실패:', error);
  }
};

const latestLogs = computed(() => {
  return logs.value.slice(0, 10);
});

const formatLoginTime = (timeString) => {
  const date = new Date(timeString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  max-width: 1400px;
  margin: auto;
}

.title {
  font-size: 2.5rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.grid-layout {
  display: grid;
  grid-template-areas:
    'camera camera'
    'dashboard alert';
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}

.camera-box {
  grid-area: camera;
}

.dashboard-box {
  grid-area: dashboard;
}

.alert-box {
  grid-area: alert;
}

@media (max-width: 1200px) {
  .grid-layout {
    grid-template-areas:
      'camera'
      'dashboard'
      'alert';
    grid-template-columns: 1fr;
  }
}

.box {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 25px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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

.table-wrapper {
  max-height: 300px;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

table th {
  background-color: #f4f4f4;
}

.success {
  color: #38a169;
  font-weight: bold;
}

.failure {
  color: #e53e3e;
  font-weight: bold;
}

.scroll-list {
  max-height: 300px;
  overflow-y: auto;
  padding-left: 20px;
  list-style: disc;
}

.scroll-list li {
  margin-bottom: 8px;
  font-size: 1rem;
}
</style>
