<template>
  <div class="home-container">
    <h1 class="title">🏠 홈 화면</h1>
    <div class="grid-layout">
      <!-- 1. 카메라 박스 -->
      <div class="box camera-box">
        <h2>카메라</h2>

        <!-- 기본 카메라가 설정되어 있으면 -->
        <div v-if="cameraBaseUrl" class="camera-streams">
          <div class="stream-thumb">
            <img
              :src="cameraBaseUrl"
              alt="Camera Stream"
              class="camera-stream"
            />
          </div>
        </div>

        <!-- 기본 카메라가 없음일 경우 -->
        <p v-else class="no-msg">설정 페이지를 확인하세요.</p>
      </div>

      <!-- 2. 대시보드 박스 -->
      <div class="box dashboard-box">
        <h2>대시보드</h2>
        <div class="table-wrapper" v-if="latestLogs.length > 0">
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

        <!-- ✅ 표시 개수가 0이면 안내 문구 출력 -->
        <p v-else class="no-dashboard-msg">설정 페이지를 확인하세요.</p>
      </div>

      <!-- 3. 알림 리스트 -->
      <div class="box alert-box">
        <h2>알림</h2>
        <ul class="scroll-list" v-if="alertItemLimit !== 0">
          <li
            v-for="(alert, index) in latestAlerts"
            :key="index"
            class="alert-item"
          >
            <div class="time">{{ formatLoginTime(alert.time) }}</div>
            <div class="msg">{{ alert.message }}</div>
          </li>
          <li v-if="latestAlerts.length === 0" class="no-msg">
            알림이 없습니다.
          </li>
        </ul>
        <p v-else class="no-msg">설정 페이지를 확인하세요.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const cameraBaseUrl = ref('');

const cameras = ref([]);
const logs = ref([]);
const alerts = ref([]);

const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

// ✅ 사용자 설정값
const dashboardItemLimit = ref(0);
const alertItemLimit = ref(0);

// ✅ 마운트 시 한 번만 모든 데이터 로딩
onMounted(async () => {
  if (!userId) return;

  await fetchSettings(); // 설정 먼저 불러온 뒤
  await Promise.all([fetchCameras(), fetchLogs(), fetchAlerts()]);
});

async function fetchSettings() {
  try {
    const { data } = await axios.get(
      `http://203.234.19.95:23918/api/user/page-settings/${userId}`,
    );
    cameraBaseUrl.value = data.camera_base_url || '';
    dashboardItemLimit.value = data.dashboard_item_count || 0;
    alertItemLimit.value = data.alert_item_count || 0;
  } catch (e) {
    console.error('설정 불러오기 실패', e);
  }
}

async function fetchCameras() {
  try {
    const res = await axios.get('http://203.234.19.95:23918/api/device/list');
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

async function fetchLogs() {
  try {
    const { data } = await axios.get(
      `http://203.234.19.95:23918/api/auth/login-logs?user_id=${userId}`,
    );
    logs.value = data;
  } catch (e) {
    console.error('로그 불러오기 실패', e);
  }
}

async function fetchAlerts() {
  try {
    const { data } = await axios.get(
      `http://203.234.19.95:23918/api/alerts?user_id=${userId}`,
    );
    alerts.value = data;
  } catch (e) {
    console.error('알림 불러오기 실패', e);
  }
}

// ✅ 개수 제한에 따라 자르기

const latestLogs = computed(() =>
  dashboardItemLimit.value === 0
    ? []
    : logs.value.slice(0, dashboardItemLimit.value),
);
const latestAlerts = computed(() =>
  alertItemLimit.value === 0 ? [] : alerts.value.slice(0, alertItemLimit.value),
);

// ✅ 시간 포맷
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

.box h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2b6cb0; /* 예: 파란 계열 강조 색 */
  margin-bottom: 15px;
  border-bottom: 2px solid #2b6cb0;
  padding-bottom: 6px;
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

.no-dashboard-msg {
  text-align: center;
  padding: 20px;
  color: #4a5568; /* 진회색, 깔끔 */
  font-weight: 500;
  font-size: 0.95rem;
}

.no-msg {
  text-align: center;
  padding: 20px;
  color: #4a5568; /* 진회색, 깔끔 */
  font-weight: 500;
  font-size: 0.95rem;
}
</style>
