<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">로그인</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            v-model="email"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label class="block text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            v-model="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••"
            required
          />
        </div>
        <button
          type="submit"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
        >
          로그인
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: email.value.trim(),
      password: password.value.trim(),
    });

    const token = response.data.token;
    const user = response.data.user;

    // 토큰을 로컬스토리지에 저장
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    alert('로그인 성공!');
    router.push('/home');
  } catch (error) {
    console.error(
      '로그인 실패:',
      error.response?.data?.message || error.message,
    );
    alert(error.response?.data?.message || '로그인 실패');
  }
};
</script>
