<template>
  <div class="settings-container">
    <div class="settings-grid">
      <!-- 페이지 설정 -->
      <div class="setting-box">
        <h3 class="box-title center">페이지 설정</h3>

        <!-- 카메라 -->
        <div class="setting-group">
          <label class="setting-label">기본 카메라</label>
          <select v-model="cameraBaseUrl" class="setting-input spaced">
            <option value="">없음</option>
            <option
              v-for="camera in registeredCameras"
              :key="camera.id"
              :value="camera.url"
            >
              {{ camera.device_name }} ({{ camera.url }})
            </option>
          </select>
        </div>

        <!-- 대시보드 표시 개수 -->
        <div class="setting-group">
          <label class="setting-label">대시보드 표시 개수</label>
          <select v-model="dashboardItemCount" class="setting-input spaced">
            <option value="0">없음</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <!-- 알림 표시 개수 -->
        <div class="setting-group">
          <label class="setting-label">알림 표시 개수</label>
          <select v-model="alertItemCount" class="setting-input spaced">
            <option value="0">없음</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <!-- 알림 수신 설정 -->
        <div class="setting-group">
          <label class="setting-label">알림 수신 설정</label>
          <select v-model="notificationSetting" class="setting-input spaced">
            <option value="on">허용</option>
            <option value="off">끔</option>
          </select>
        </div>

        <div class="actions">
          <button @click="savePageSettings" :disabled="!hasChanged">
            저장
          </button>
          <!-- 페이지 설정 저장 메시지 -->
          <p v-if="pageMessage" class="message">{{ pageMessage }}</p>
        </div>
      </div>

      <!-- 사용자 설정 -->
      <div class="setting-box">
        <h3 class="box-title center">사용자 설정</h3>

        <div class="setting-group">
          <label class="setting-label">현재 비밀번호</label>
          <input
            v-model="currentPassword"
            type="password"
            class="setting-input spaced"
          />
          <p v-if="passwordErrors.current" class="error-msg">
            {{ passwordErrors.current }}
          </p>
        </div>

        <div class="setting-group">
          <label class="setting-label">새 비밀번호</label>
          <input
            v-model="newPassword"
            type="password"
            class="setting-input spaced"
          />
          <p v-if="passwordErrors.new" class="error-msg">
            {{ passwordErrors.new }}
          </p>
        </div>

        <div class="setting-group">
          <label class="setting-label">비밀번호 확인</label>
          <input
            v-model="confirmPassword"
            type="password"
            class="setting-input spaced"
          />
          <p v-if="passwordErrors.confirm" class="error-msg">
            {{ passwordErrors.confirm }}
          </p>
        </div>

        <div class="actions">
          <button @click="saveUserPassword" :disabled="!canChangePassword">
            저장
          </button>
        </div>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import axios from 'axios';

const cameraBaseUrl = ref('');
const dashboardItemCount = ref('0');
const alertItemCount = ref('0');
const notificationSetting = ref('off');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const passwordErrors = ref({
  current: '',
  new: '',
  confirm: '',
});

const pageMessage = ref('');
const passwordMessage = ref('');
const initialSettings = ref({});

const registeredCameras = ref([]);

watch(
  [notificationSetting, cameraBaseUrl, dashboardItemCount, alertItemCount],
  ([new1, new2, new3, new4]) => {
    const original = initialSettings.value;
    hasChanged.value =
      original.notificationSetting !== new1 ||
      original.cameraBaseUrl !== new2 ||
      original.dashboardItemCount !== new3 ||
      original.alertItemCount !== new4;
  },
);

const hasChanged = ref(false);
const alertItemLimit = ref(0);

onMounted(async () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  try {
    const { data: deviceData } = await axios.get(
      `http://203.234.19.95:23918/api/device/list`,
    );
    registeredCameras.value = deviceData.devices.map((device) => ({
      id: device.id,
      device_name: device.device_name,
      url: `http://${device.ip_address}:82/stream`,
    }));
    const settings = await axios.get(
      `http://203.234.19.95:23918/api/user/page-settings/${user.id}`,
    );
    alertItemLimit.value = settings.data.alert_item_count || 0;
    const { data: settingData } = await axios.get(
      `http://203.234.19.95:23918/api/user/page-settings/${user.id}`,
    );
    notificationSetting.value = settingData.notification_setting;
    cameraBaseUrl.value = settingData.camera_base_url;
    dashboardItemCount.value = settingData.dashboard_item_count.toString();
    alertItemCount.value = settingData.alert_item_count.toString();
  } catch (e) {
    console.error('설정 초기화 실패:', e);
  }

  initialSettings.value = {
    notificationSetting: notificationSetting.value,
    cameraBaseUrl: cameraBaseUrl.value,
    dashboardItemCount: dashboardItemCount.value,
    alertItemCount: alertItemCount.value,
  };
});

const canChangePassword = computed(() => {
  return currentPassword.value || newPassword.value || confirmPassword.value;
});

const savePageSettings = async () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    await axios.post('http://203.234.19.95:23918/api/user/page-settings', {
      user_id: user.id,
      camera_base_url: cameraBaseUrl.value,
      dashboard_item_count: parseInt(dashboardItemCount.value),
      alert_item_count: parseInt(alertItemCount.value),
      notification_setting: notificationSetting.value,
    });
    pageMessage.value = '페이지 설정이 저장되었습니다.';
    initialSettings.value = {
      notificationSetting: notificationSetting.value,
      cameraBaseUrl: cameraBaseUrl.value,
      dashboardItemCount: dashboardItemCount.value,
    };
  } catch (e) {
    console.error('페이지 설정 저장 실패:', e);
    pageMessage.value = '페이지 설정 저장 중 오류가 발생했습니다.';
  }
};

const saveUserPassword = async () => {
  passwordErrors.value = { current: '', new: '', confirm: '' };
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const passwordValid =
    /[A-Za-z]/.test(newPassword.value) &&
    /[0-9]/.test(newPassword.value) &&
    /[!@#$%^&*()\-_=+{}[\]:"'|<>,.?/~]/.test(newPassword.value) &&
    newPassword.value.length >= 10 &&
    !/[\\/;%]/.test(newPassword.value);

  if (!passwordValid) {
    passwordErrors.value.new =
      '비밀번호는 영문+숫자+특수문자 포함 10자 이상이어야 합니다.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordErrors.value.confirm = '비밀번호가 일치하지 않습니다.';
    return;
  }

  try {
    await axios.post('http://203.234.19.95:23918/api/auth/change-password', {
      user_id: user.id,
      current_password: currentPassword.value,
      new_password: newPassword.value,
    });
    passwordMessage.value = '비밀번호가 변경되었습니다.';
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
  } catch (e) {
    console.error('비밀번호 변경 실패:', e);
    if (e.response?.data?.message) {
      passwordErrors.value.current = e.response.data.message;
    } else {
      passwordMessage.value = '비밀번호 변경 중 오류가 발생했습니다.';
    }
  }
};
</script>

<style scoped>
.settings-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}

.setting-box {
  background-color: #f9f9f9;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
}

.box-title {
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #2d3748;
}

.center {
  text-align: center;
}

.setting-group {
  margin-bottom: 1.5rem;
}

.setting-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2d3748;
}

.setting-input {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #cbd5e0;
  font-size: 1rem;
}

.spaced {
  margin-bottom: 10px;
}

.actions {
  text-align: center;
  margin-top: 10px;
}

.actions button {
  background-color: #4299e1;
  color: white;
  padding: 8px 16px;
  font-size: 0.95rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}

.actions button:disabled {
  background-color: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  border: 1px solid #cbd5e0;
}

.actions button:hover:enabled {
  background-color: #3182ce;
}

.message {
  margin-top: 1rem;
  text-align: center;
  color: #2f855a;
  font-weight: bold;
  white-space: pre-line;
}

.error-msg {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 5px;
}
</style>
