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
          <!-- formatTime 호출 -->
          <span class="time">{{ formatTime(alert.time) }}</span>
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
import { ref, onMounted } from 'vue';
import axios from 'axios';

const alerts = ref([]);

// 로그인 시 localStorage에 저장된 user 객체에서 id 꺼내기
const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;

onMounted(() => {
  if (!userId) return;
  axios
    .get(`http://localhost:5000/api/alerts?user_id=${userId}`)
    .then(({ data }) => {
      alerts.value = data;
    })
    .catch((err) => {
      console.error('알림 조회 실패:', err);
    });
});

/**
 * ISO 8601 문자열(UTC)을 사용자의 로컬 타임존 포맷으로 변환
 * @param {string} isoString
 * @returns {string}
 */
function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString();
}

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
