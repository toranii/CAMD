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
import { ref, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

// 이벤트를 부모 컴포넌트로 전달하기 위한 정의
const emit = defineEmits(['login-success']); // 부모 컴포넌트로 이벤트 전달

const email = ref('');
const password = ref('');
const router = useRouter();

const handleLogin = () => {
  console.log('로그인 시도:', email.value, password.value);
  // 로그인 성공 시
  if (email.value && password.value) {
    // 로그인 성공 시, 부모 컴포넌트(App.vue)로 이벤트를 보내 isLoggedIn을 true로 변경
    emit('login-success'); // 부모 컴포넌트로 login-success 이벤트 발생
    router.push('/home'); // 로그인 후 '/camera' 페이지로 이동
  } else {
    alert('이메일과 비밀번호를 입력해주세요.');
  }
};
</script>
