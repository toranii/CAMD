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
            <th>시간</th>
            <th>IP 주소</th>
            <th>이메일</th>
            <th class="event-col">내용</th>
            <th>결과</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in filteredAndSortedLogs" :key="index">
            <td>{{ formatLoginTime(log.login_time) }}</td>
            <td>{{ log.ip_address }}</td>
            <td>{{ log.email }}</td>
            <td class="event-content">로그인 시도</td>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';

// 📌 상태 변수 선언
const logs = ref([]);
const filterField = ref('date');
const filterKeyword = ref('');
const sortOption = ref('desc');

// 📌 서버에서 로그인 로그 가져오기
const fetchLogs = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/auth/login-logs',
    );
    logs.value = response.data;
  } catch (error) {
    console.error('로그 데이터 가져오기 실패:', error);
  }
};

onMounted(() => {
  fetchLogs();
});

// 📌 필터 및 정렬 처리
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

// 📌 검색어 초기화
const resetFilterKeyword = () => {
  filterKeyword.value = '';
};

// 📌 시간 포맷 변경 함수 (yyyy-mm-dd / hh:mm:ss)
const formatLoginTime = (timeString) => {
  const date = new Date(timeString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} / ${hh}:${min}:${ss}`;
};

// 📌 날짜(yyyy-mm-dd) 포맷만 따로 뽑는 함수
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
  max-width: 1100px;
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

/* 표 스타일 */
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-col,
.event-content {
  max-width: 300px;
  white-space: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}

table th {
  background-color: #f4f4f4;
  font-weight: bold;
}

table tr:nth-child(even) {
  background-color: #f9f9f9;
}

table tr:hover {
  background-color: #f1f1f1;
}

/* 성공/실패 색상 */
.success {
  color: #38a169;
  font-weight: bold;
}

.failure {
  color: #e53e3e;
  font-weight: bold;
}
</style>
