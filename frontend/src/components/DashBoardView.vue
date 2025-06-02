<template>
  <div class="dashboard-container">
    <h2 class="title">📊 대시보드</h2>

    <!-- 필터 및 정렬 옵션 -->
    <div class="controls">
      <select
        v-model="filterField"
        @change="resetFilterKeyword"
        class="control-select"
      >
        <option value="date">시간</option>
        <option value="ip">IP 주소</option>
        <option value="email">이메일</option>
        <option value="event">내용</option>
        <option value="success">결과</option>
      </select>

      <input
        v-if="filterField !== 'success' && filterField !== 'date'"
        v-model="filterKeyword"
        type="text"
        class="control-input"
        placeholder="검색어 입력"
      />

      <input
        v-else-if="filterField === 'date'"
        v-model="filterKeyword"
        type="date"
        class="control-input"
      />

      <select v-else v-model="filterKeyword" class="control-select">
        <option value="O">O</option>
        <option value="X">X</option>
      </select>

      <select v-model="sortOption" class="control-select">
        <option value="desc">최신순</option>
        <option value="asc">오래된순</option>
      </select>
    </div>

    <!-- 로그인 로그 테이블 -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th class="narrow">번호</th>
            <th class="wide">시간</th>
            <th class="medium">IP 주소</th>
            <th class="medium">이메일</th>
            <th class="wide">내용</th>
            <th class="narrow">결과</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in paginatedLogs" :key="index">
            <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
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

const logs = ref([]);
const filterField = ref('date');
const filterKeyword = ref('');
const sortOption = ref('desc');
const currentPage = ref(1);
const itemsPerPage = 20;

const fetchLogs = async () => {
  try {
    // 로그인한 사용자 정보에서 ID 꺼내기
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const response = await axios.get(
      `http://203.234.19.95:23918/api/auth/login-logs?user_id=${user.id}`,
    );
    logs.value = response.data.slice(0, 200);
  } catch (error) {
    console.error('로그 데이터 가져오기 실패:', error);
  }
};

onMounted(() => {
  fetchLogs();
});

const filteredAndSortedLogs = computed(() => {
  let filtered = logs.value;

  if (filterKeyword.value) {
    const keyword = filterKeyword.value.toLowerCase();
    filtered = filtered.filter((log) => {
      if (filterField.value === 'date') {
        const formatted = formatDateOnly(log.login_time);
        return formatted === keyword;
      }
      if (filterField.value === 'ip') return log.ip_address.includes(keyword);
      if (filterField.value === 'email') return log.email.includes(keyword);
      if (filterField.value === 'event') return '로그인 시도'.includes(keyword);
      if (filterField.value === 'success')
        return keyword === 'o' ? log.success === 1 : log.success !== 1;
      return true;
    });
  }

  if (sortOption.value === 'desc') {
    filtered = filtered
      .slice()
      .sort((a, b) => new Date(b.login_time) - new Date(a.login_time));
  } else {
    filtered = filtered
      .slice()
      .sort((a, b) => new Date(a.login_time) - new Date(b.login_time));
  }

  return filtered;
});

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAndSortedLogs.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredAndSortedLogs.value.length / itemsPerPage);
});

const resetFilterKeyword = () => {
  filterKeyword.value = '';
  currentPage.value = 1;
};

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

const formatDateOnly = (timeString) => {
  const date = new Date(timeString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};
</script>

<style scoped>
.dashboard-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #fefefe;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  color: #2d3748;
  text-align: center;
}

.controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.control-select,
.control-input {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 1rem;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
  white-space: nowrap;
}

th.narrow {
  width: 40px;
}

th.medium {
  width: 120px;
}

th.wide {
  min-width: 180px;
}

.success {
  color: #38a169;
  font-weight: bold;
}

.failure {
  color: #e53e3e;
  font-weight: bold;
}

.pagination {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.pagination button {
  padding: 0.4rem 0.8rem;
  border: 1px solid #ccc;
  background-color: white;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button.active {
  background-color: #4fd1c5;
  color: white;
  font-weight: bold;
}

@media (max-width: 768px) {
  table,
  table th,
  table td {
    font-size: 0.8rem;
  }
}
</style>
