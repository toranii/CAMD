<template>
  <div class="alert-container">
    <h2 class="title">🔔 알림</h2>

    <!-- 알림 리스트 -->
    <div class="alert-list">
      <ul>
        <li
          v-for="(alert, index) in alerts"
          :key="index"
          :class="{ selected: selectedAlerts.includes(index) }"
          @click="deleteMode && toggleSelect(index)"
        >
          <span class="time">{{ alert.time }}</span>
          <span class="msg">{{ alert.message }}</span>
        </li>
      </ul>
    </div>

    <!-- 삭제 버튼 및 확인/취소 버튼 -->
    <div class="actions">
      <button
        v-if="!deleteMode"
        @click="deleteMode = true"
        class="common-btn delete-btn"
      >
        삭제
      </button>
      <template v-else>
        <button
          @click="confirmDelete"
          class="common-btn confirm-btn"
          :disabled="selectedAlerts.length === 0"
        >
          확인
        </button>
        <button @click="cancelDelete" class="common-btn cancel-btn">
          취소
        </button>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const alerts = ref([
  { time: '2025-04-10 09:00:00', message: '카메라 연결 끊김 감지' },
  { time: '2025-04-10 09:05:00', message: '비정상 로그인 시도 탐지' },
  { time: '2025-04-10 09:10:00', message: '침입 감지 알림 전송됨' },
]);

const deleteMode = ref(false);
const selectedAlerts = ref([]);

const toggleSelect = (index) => {
  if (selectedAlerts.value.includes(index)) {
    selectedAlerts.value = selectedAlerts.value.filter((i) => i !== index);
  } else {
    selectedAlerts.value.push(index);
  }
};

const confirmDelete = () => {
  if (selectedAlerts.value.length === 0) return;
  alerts.value = alerts.value.filter(
    (_, index) => !selectedAlerts.value.includes(index),
  );
  selectedAlerts.value = [];
  deleteMode.value = false;
};

const cancelDelete = () => {
  selectedAlerts.value = [];
  deleteMode.value = false;
};
</script>

<style scoped>
.alert-container {
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fefefe;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #2d3748;
}

.alert-list ul {
  list-style: none;
  padding: 0;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.alert-list li {
  padding: 10px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  cursor: pointer;
}

.alert-list li:last-child {
  border-bottom: none;
}

.alert-list li.selected {
  background-color: #bee3f8;
  opacity: 0.8;
}

.time {
  color: #a0aec0;
  font-size: 0.85rem;
  margin-right: 1rem;
}

.msg {
  color: #2d3748;
  flex: 1;
}

.actions {
  margin-top: 1rem;
  text-align: right;
}

.common-btn {
  padding: 8px 16px;
  font-size: 0.9rem;
  border-radius: 6px;
  cursor: pointer;
  border: none;
  margin-left: 0.5rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.common-btn:disabled {
  background-color: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  border: 1px solid #cbd5e0;
}

.delete-btn {
  background-color: #e53e3e;
  color: white;
}

.confirm-btn {
  background-color: #4a90e2;
  color: white;
}

.cancel-btn {
  background-color: #e53e3e;
  color: white;
}
</style>
