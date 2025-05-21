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
            <option
              v-for="camera in dummyCameras"
              :key="camera.id"
              :value="camera.url"
            >
              {{ camera.name }} ({{ camera.url }})
            </option>
          </select>
        </div>

        <!-- 대시보드 표시 개수 -->
        <div class="setting-group">
          <label class="setting-label">대시보드 표시 개수</label>
          <select v-model="dashboardItemCount" class="setting-input spaced">
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
            <option value="all">모든 알림</option>
            <option value="important">중요 알림만</option>
            <option value="none">알림 받지 않음</option>
          </select>
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
          <button @click="saveSettings" :disabled="!hasChanged">저장</button>
        </div>
        <p v-if="message" class="message">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const notificationSetting = ref('all');
const cameraBaseUrl = ref('');
const dashboardItemCount = ref('10');

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const passwordErrors = ref({
  current: '',
  new: '',
  confirm: '',
});

const message = ref('');
const initialSettings = ref({});

const dummyCameras = [
  { id: 0, name: '카메라 기본', url: 'http://192.168.0.7:81/stream' },
  { id: 1, name: '카메라 A', url: 'http://192.168.0.101:81/stream' },
  { id: 2, name: '카메라 B', url: 'http://192.168.0.102:81/stream' },
  { id: 3, name: '카메라 C', url: 'http://192.168.0.103:81/stream' },
];

onMounted(() => {
  const savedCameraUrl = localStorage.getItem('cameraBaseUrl');
  if (savedCameraUrl) cameraBaseUrl.value = savedCameraUrl;

  initialSettings.value = {
    notificationSetting: notificationSetting.value,
    cameraBaseUrl: cameraBaseUrl.value,
    dashboardItemCount: dashboardItemCount.value,
  };
});

const hasChanged = computed(() => {
  return (
    notificationSetting.value !== initialSettings.value.notificationSetting ||
    cameraBaseUrl.value !== initialSettings.value.cameraBaseUrl ||
    dashboardItemCount.value !== initialSettings.value.dashboardItemCount ||
    currentPassword.value ||
    newPassword.value ||
    confirmPassword.value
  );
});

const saveSettings = () => {
  passwordErrors.value = { current: '', new: '', confirm: '' };

  // 새 비밀번호 조건: 특수문자 + 영문 + 숫자 + 길이 >= 10, 금지 문자 없음
  const passwordValid =
    /[A-Za-z]/.test(newPassword.value) &&
    /[0-9]/.test(newPassword.value) &&
    /[!@#$%^&*()\-_=+{}\\[\]:"'|<>,.?/~]/.test(newPassword.value) &&
    newPassword.value.length >= 10 &&
    !/[\\/;%]/.test(newPassword.value);

  if (newPassword.value && !passwordValid) {
    passwordErrors.value.new =
      '비밀번호는 영문+숫자+특수문자 포함 10자 이상이어야 합니다.';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    passwordErrors.value.confirm = '비밀번호가 일치하지 않습니다.';
    return;
  }

  if (currentPassword.value !== 'dummy') {
    passwordErrors.value.current = '현재 비밀번호가 올바르지 않습니다.';
    return;
  }

  message.value = `설정이 저장되었습니다.\n알림: ${notificationSetting.value}, 대시보드 개수: ${dashboardItemCount.value}, 카메라: ${cameraBaseUrl.value}`;

  if (newPassword.value) {
    message.value += `\n비밀번호가 변경되었습니다.`;
  }

  localStorage.setItem('cameraBaseUrl', cameraBaseUrl.value);

  initialSettings.value = {
    notificationSetting: notificationSetting.value,
    cameraBaseUrl: cameraBaseUrl.value,
    dashboardItemCount: dashboardItemCount.value,
  };
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
