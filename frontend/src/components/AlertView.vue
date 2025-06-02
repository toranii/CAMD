<template>
  <div class="alert-container">
    <h2 class="title">🔔 알림</h2>

    <!-- 필터 및 정렬 -->
    <div class="controls">
      <input
        v-model="filterKeyword"
        type="text"
        class="control-input"
        placeholder="메시지 검색"
      />
      <select v-model="sortOption" class="control-select">
        <option value="desc">최신순</option>
        <option value="asc">오래된순</option>
      </select>
    </div>

    <!-- 알림 리스트 -->
    <div class="alert-list">
      <ul>
        <li v-if="notificationSetting === 'off'" class="disabled-msg">
          ⚠️ 알림 수신이 꺼져 있습니다. 설정 페이지에서 알림 수신을 켜주세요.
        </li>

        <li
          v-for="(alert, index) in paginatedAlerts"
          :key="index"
          :class="{ selected: selectedAlerts.includes(index) }"
          @click="deleteMode && toggleSelect(index)"
        >
          <span class="time">{{ formatTime(alert.time) }}</span>
          <span class="msg">{{ alert.message }}</span>
        </li>

        <li v-if="paginatedAlerts.length === 0" class="empty-msg">
          표시할 알림이 없습니다.
        </li>
      </ul>
    </div>

    <!-- 삭제 버튼 및 확인/취소 -->
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

    <!-- 페이지네이션 -->
    <div class="pagination">
      <button
        v-for="page in totalPages"
        :key="page"
        :class="{ active: page === currentPage }"
        @click="currentPage = page"
      >
        {{ page }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

const alerts = ref([]);
const filterKeyword = ref('');
const sortOption = ref('desc');
const currentPage = ref(1);
const itemsPerPage = 20;

const user = JSON.parse(localStorage.getItem('user') || '{}');
const userId = user.id;
const notificationSetting = ref('off');

async function fetchNotificationSetting() {
  try {
    const res = await axios.get(
      `http://203.234.19.95:23918/api/user/page-settings/${userId}`,
    );
    notificationSetting.value = res.data.notification_setting || 'off';
  } catch (err) {
    console.error('설정 조회 실패:', err);
  }
}

const fetchAlerts = async () => {
  if (!userId) return;
  try {
    const { data } = await axios.get(
      `http://203.234.19.95:23918/api/alerts?user_id=${userId}`,
    );
    alerts.value = data;
  } catch (err) {
    console.error('알림 조회 실패:', err);
  }
};

onMounted(async () => {
  await fetchNotificationSetting(); // 먼저 알림 수신 여부 확인
  await fetchAlerts(); // 이후 알림 불러오기
  setInterval(fetchAlerts, 1000); // 이후 주기적 자동 갱신
});

const filteredAndSortedAlerts = computed(() => {
  let filtered = alerts.value;

  // 필터링
  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase();
    filtered = filtered.filter((a) =>
      a.message.toLowerCase().includes(keyword),
    );
  }

  // 정렬
  if (sortOption.value === 'desc') {
    filtered = filtered
      .slice()
      .sort((a, b) => new Date(b.time) - new Date(a.time));
  } else {
    filtered = filtered
      .slice()
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  return filtered;
});

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedAlerts.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredAndSortedAlerts.value.length / itemsPerPage),
);

// 삭제 관련
const deleteMode = ref(false);
const selectedAlerts = ref([]);

const toggleSelect = (index) => {
  if (selectedAlerts.value.includes(index)) {
    selectedAlerts.value = selectedAlerts.value.filter((i) => i !== index);
  } else {
    selectedAlerts.value.push(index);
  }
};

const confirmDelete = async () => {
  if (selectedAlerts.value.length === 0) return;
  const idsToDelete = selectedAlerts.value.map(
    (i) => paginatedAlerts.value[i].id,
  );

  try {
    await axios.post('http://203.234.19.95:23918/api/alerts/delete', {
      alert_ids: idsToDelete,
    });

    alerts.value = alerts.value.filter((a) => !idsToDelete.includes(a.id));
    selectedAlerts.value = [];
    deleteMode.value = false;
  } catch (err) {
    console.error('알림 삭제 실패:', err);
  }
};

const cancelDelete = () => {
  selectedAlerts.value = [];
  deleteMode.value = false;
};

function formatTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString();
}
</script>

<style scoped>
.alert-container {
  padding: 2rem;
  max-width: 1200px;
  max-height: 800px;
  min-height: 600px;
  margin: 0 auto;
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
  max-height: 300px;
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

.controls {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-select,
.control-input {
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pagination button {
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
}

.pagination button.active {
  background-color: #4fd1c5;
  color: white;
  font-weight: bold;
}

.empty-msg {
  text-align: center;
  padding: 1rem;
  font-style: italic;
  color: #a0aec0;
}

.disabled-msg {
  background-color: #fefcbf;
  color: #744210;
  font-weight: 500;
  padding: 10px;
  text-align: center;
  border-bottom: 1px solid #e2e8f0;
}
</style>
