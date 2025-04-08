<template>
  <div class="dashboard-container">
    <h2>📊 대시보드</h2>
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
          <td>{{ log.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const logs = ref([
  { time: '2025-03-21 14:32:00', event: '로그인 성공', status: '정상' },
  { time: '2025-03-21 14:45:12', event: '카메라 연결', status: '정상' },
  { time: '2025-03-21 15:01:45', event: '알림 발송', status: '성공' },
  // 초기에는 간단한 더미 데이터로 시작
]);
</script>

<style scoped>
.dashboard-container {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  border: 1px solid #ddd;
  padding: 8px;
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
