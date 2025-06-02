<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-10 rounded-2xl shadow-xl w-full max-w-md">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">로그인</h2>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <!-- 이메일 입력 -->
        <div>
          <label class="block text-gray-700 mb-1">이메일</label>
          <input
            type="email"
            v-model="email"
            @input="sanitizeEmail"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="you@example.com"
            required
          />
        </div>
        <!-- 비밀번호 입력 -->
        <div>
          <label class="block text-gray-700 mb-1">비밀번호</label>
          <input
            type="password"
            v-model="password"
            @input="sanitizePassword"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="••••••••••"
            required
          />
        </div>
        <!-- 로그인 버튼 -->
        <button
          type="submit"
          class="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition duration-200"
        >
          로그인
        </button>
      </form>
      <!-- ✅ 회원가입 이동 버튼 추가 -->
      <div class="mt-6 text-center">
        <p class="text-gray-600 text-sm mb-2">아직 회원이 아니신가요?</p>
        <button
          @click="goToSignup"
          class="py-2 px-6 bg-green-400 hover:bg-green-500 text-white font-semibold rounded-lg transition duration-200"
        >
          회원가입
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2'; // ✅ 추가

const email = ref('');
const password = ref('');
const router = useRouter();

// 회원가입 이동
const goToSignup = () => {
  router.push('/signup');
};

const sanitizeEmail = () => {
  // 공격에 사용될 수 있는 특수문자 제거
  email.value = email.value.replace(/[<>'"\\/%;&=?!]/g, '');
};

const sanitizePassword = () => {
  // 허용된 문자만 남기고 제거 (영문, 숫자, @$!%*#?&)
  password.value = password.value.replace(/[^A-Za-z\d@$!%*#?&]/g, '');
};

const handleLogin = async () => {
  try {
    const response = await axios.post(
      'http://203.234.19.95:23918/api/auth/login',
      {
        email: email.value.trim(),
        password: password.value.trim(),
      },
    );

    const token = response.data.token;
    const user = response.data.user;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    await router.push('/home');
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || '로그인에 실패했습니다.';

    if (status === 429) {
      // 차단 상태
      Swal.fire({
        title: '로그인 제한',
        html: message, // 줄바꿈 포함 메시지 처리
        icon: 'warning',
        confirmButtonText: '확인',
      });
    } else if (status === 401) {
      // 이메일/비밀번호 오류
      Swal.fire({
        title: '로그인 실패',
        text: message,
        icon: 'error',
        confirmButtonText: '확인',
      });
    } else {
      // 기타 오류
      Swal.fire({
        title: '오류',
        text: '로그인 중 문제가 발생했습니다.',
        icon: 'error',
        confirmButtonText: '확인',
      });
    }
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    // ✅ 로그인된 상태에서 /login에 접근하면 자동 이동
    router.replace('/home');
  }
});
</script>
