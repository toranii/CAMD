<template>
  <div class="settings-container">
    <h2 class="title">⚙️ 설정</h2>
    <p class="description">사용자 맞춤 설정을 조정할 수 있습니다.</p>

    <!-- 알림 설정 -->
    <div class="setting-group">
      <label class="setting-label">알림 수신</label>
      <select v-model="notificationSetting" class="setting-input">
        <option value="all">모든 알림</option>
        <option value="important">중요 알림만</option>
        <option value="none">알림 받지 않음</option>
      </select>
    </div>

    <!-- 닉네임 설정 -->
    <div class="setting-group">
      <label class="setting-label" for="nickname">닉네임 변경</label>
      <input
        id="nickname"
        v-model="nickname"
        type="text"
        placeholder="예: 홍길동"
        class="setting-input"
      />
    </div>

    <!-- 비밀번호 재설정 -->
    <div class="setting-group">
      <label class="setting-label" for="password">비밀번호 재설정</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="새 비밀번호 입력"
        class="setting-input"
      />
    </div>

    <!-- 카메라 기본 주소 설정 -->
    <div class="setting-group">
      <label class="setting-label" for="cameraBaseUrl">기본 카메라 선택</label>
      <select id="cameraBaseUrl" v-model="cameraBaseUrl" class="setting-input">
        <option
          v-for="camera in dummyCameras"
          :key="camera.id"
          :value="camera.url"
        >
          {{ camera.name }} ({{ camera.url }})
        </option>
      </select>
    </div>

    <div class="actions">
      <button @click="saveSettings">💾 저장</button>
    </div>

    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const notificationSetting = ref('all');
const nickname = ref('');
const password = ref('');
const cameraBaseUrl = ref('');
const message = ref('');

// 더미 카메라 목록 (추후 백엔드 연동 예정)
const dummyCameras = [
  { id: 0, name: '카메라 기본', url: 'http://192.168.0.7:81/stream' },
  { id: 1, name: '카메라 A', url: 'http://192.168.0.101:81/stream' },
  { id: 2, name: '카메라 B', url: 'http://192.168.0.102:81/stream' },
  { id: 3, name: '카메라 C', url: 'http://192.168.0.103:81/stream' },
];

onMounted(() => {
  const savedCameraUrl = localStorage.getItem('cameraBaseUrl');
  if (savedCameraUrl) cameraBaseUrl.value = savedCameraUrl;
});

const saveSettings = () => {
  message.value = `설정이 저장되었습니다.\n알림: ${
    notificationSetting.value
  }, 닉네임: ${nickname.value || '없음'}, 카메라 주소: ${
    cameraBaseUrl.value || '미입력'
  }`;
  if (password.value) {
    message.value += `\n비밀번호가 변경되었습니다.`;
  }
  localStorage.setItem('cameraBaseUrl', cameraBaseUrl.value);
};
</script>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  color: #2d3748;
}

.description {
  text-align: center;
  color: #4a5568;
  margin-bottom: 2rem;
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

.actions {
  text-align: right;
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

.actions button:hover {
  background-color: #3182ce;
}

.message {
  margin-top: 1rem;
  text-align: center;
  color: #2f855a;
  font-weight: bold;
  white-space: pre-line;
}
</style>
