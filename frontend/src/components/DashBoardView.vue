<template>
  <div class="dashboard-container">
    <h2 class="title">📊 대시보드</h2>

    <!-- 요약 카드들 -->
    <div class="summary-cards">
      <div class="card">
        <p class="label">총 이벤트</p>
        <p class="value">{{ logs.length }}</p>
      </div>
      <div class="card">
        <p class="label">정상 상태</p>
        <p class="value">{{ normalCount }}</p>
      </div>
      <div class="card">
        <p class="label">위험 이벤트</p>
        <p class="value warning">{{ warningCount }}</p>
      </div>
    </div>

    <!-- 로그 테이블 -->
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>시간</th>
            <th>이벤트</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(log, index) in logs" :key="index">
            <td>{{ log.time }}</td>
            <td>{{ log.event }}</td>
            <td
              :class="{
                warning: log.status !== '정상' && log.status !== '성공',
              }"
            >
              {{ log.status }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const logs = ref([
  { time: '2025-03-21 14:32:00', event: '로그인 성공', status: '정상' },
  { time: '2025-03-21 14:45:12', event: '카메라 연결', status: '정상' },
  { time: '2025-03-21 15:01:45', event: '알림 발송', status: '성공' },
  {
    time: '2025-03-21 16:00:00',
    event: '알 수 없는 접근 시도',
    status: '위험',
  },
]);

const normalCount = computed(
  () =>
    logs.value.filter((log) => log.status === '정상' || log.status === '성공')
      .length,
);
const warningCount = computed(
  () => logs.value.filter((log) => log.status === '위험').length,
);
</script>

<style scoped>
.dashboard-container {
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

.summary-cards {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  flex: 1;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.label {
  font-size: 0.9rem;
  color: #718096;
  margin-bottom: 0.3rem;
}

.value {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2d3748;
}

.value.warning,
.warning {
  color: #e53e3e;
  font-weight: bold;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 10px;
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
</style>
