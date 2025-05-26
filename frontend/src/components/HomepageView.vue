<template>
  <div class="home-container">
    <h1 class="title"> 홈 화면</h1>
    <div class="grid-layout">
      <!-- 1. 카메라 박스 -->
      <div class="box camera-box">
        <h2>카메라</h2>
        <!-- 최신 5개 카메라 중 등록된 게 있으면 썸네일로 보여주기 -->
        <div v-if="latestCameras.length > 0" class="camera-streams">
          <div
            v-for="(cam, idx) in latestCameras"
            :key="idx"
            class="stream-thumb"
          >
            <img :src="cam.url" alt="Camera Stream" class="camera-stream" />
          </div>
        </div>
        <!-- 없으면 안내 문구 -->
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
          <li
            v-for="(alert, index) in latestAlerts"
            :key="index"
            class="alert-item"
          >
            <div class="time">{{ formatLoginTime(alert.time) }}</div>
            <div class="msg">{{ alert.message }}</div>
          </li>
          <li v-if="latestAlerts.length === 0">알림이 없습니다.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// 카메라, 로그, 알림 상태
const cameras = ref([]);
const logs = ref([]);
const alerts = ref([]);

// 로그인된 사용자
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

// 마운트 시 데이터 로드
onMounted(() => {
  fetchCameras();
  fetchLogs();
  fetchAlerts();
});

// 카메라 리스트 가져오기
async function fetchCameras() {
  if (!userId) return;
  try {
    const res = await axios.get('http://localhost:5000/api/device/list');
    if (res.data.success) {
      cameras.value = res.data.devices.map((d) => ({
        id: d.id,
        url: `http://${d.ip_address}:82/stream`,
      }));
    }
  } catch (e) {
    console.error('카메라 불러오기 실패', e);
  }
}

// 로그인 로그 (최신 5개)
async function fetchLogs() {
  if (!userId) return;
  try {
    const { data } = await axios.get(
      `http://localhost:5000/api/auth/login-logs?user_id=${userId}`,
    );
    logs.value = data;
  } catch (e) {
    console.error('로그 불러오기 실패', e);
  }
}

// 알림 (최신 5개)
async function fetchAlerts() {
  if (!userId) return;
  try {
    const { data } = await axios.get(
      `http://localhost:5000/api/alerts?user_id=${userId}`,
    );
    alerts.value = data;
  } catch (e) {
    console.error('알림 불러오기 실패', e);
  }
}

// 최신 5개 추출
const latestCameras = computed(() => cameras.value.slice(0, 5));
const latestLogs = computed(() => logs.value.slice(0, 5));
const latestAlerts = computed(() => alerts.value.slice(0, 5));

// 시간 포맷
function formatLoginTime(timeString) {
  const d = new Date(timeString);
  const yyyy = d.getFullYear();
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
}
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
  grid-template-areas: 'camera camera' 'dashboard alert';
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
    grid-template-areas: 'camera' 'dashboard' 'alert';
    grid-template-columns: 1fr;
  }
}

.box {
  border: 1px solid #ccc;
  border-radius: 12px;
  padding: 25px;
  background: #f9f9f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.camera-streams {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.stream-thumb {
  flex: 1 1 calc(50% - 10px);
}

.camera-stream {
  width: 100%;
  border-radius: 8px;
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
  background: #f4f4f4;
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
  padding: 0;
  margin: 0;
  list-style: none;
}

.alert-item {
  display: flex;
  flex-direction: column;
  padding: 8px;
  border-bottom: 1px solid #e2e8f0;
}

.alert-item:last-child {
  border-bottom: none;
}

.time {
  font-size: 0.8rem;
  color: #718096;
  margin-bottom: 4px;
}

.msg {
  font-size: 0.9rem;
  color: #2d3748;
  line-height: 1.3;
  word-break: keep-all;
}
</style>
