<template>
  <div class="camera-container">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">
      📷 카메라 스트리밍 화면
    </h2>

    <div class="input-area mb-4">
      <label for="url" class="block text-gray-700 mb-2">ESP32-CAM 주소</label>
      <input
        v-model="streamUrl"
        id="url"
        type="text"
        placeholder="예: http://192.168.0.100/"
        class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        @input="validateUrl"
      />
      <p v-if="invalidUrl" class="text-red-500 text-sm mt-1">
        유효한 URL을 입력해주세요.
      </p>
    </div>

    <div class="video-area mb-4" v-if="streamUrl && !invalidUrl">
      <img
        :src="streamUrl"
        alt="ESP32-CAM 스트리밍"
        class="w-full max-h-400px object-cover rounded-md border-2 border-gray-200"
      />
    </div>

    <div v-else class="text-center text-gray-500">
      <p>스트리밍을 보기 위한 URL을 입력해주세요.</p>
    </div>

    <!-- 로딩 상태 표시 -->
    <div v-if="loading" class="flex justify-center mt-4">
      <div
        class="spinner-border animate-spin rounded-full border-t-4 border-blue-500 w-8 h-8"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// 스트리밍 URL 상태
const streamUrl = ref('');
const invalidUrl = ref(false); // URL 유효성 검사 상태
const loading = ref(false); // 로딩 상태

// URL 유효성 검사
const validateUrl = () => {
  const urlPattern =
    /^(http:\/\/|https:\/\/)([a-zA-Z0-9.-]+)(\/[a-zA-Z0-9@:%._+~#?&//=]*)?/;

  invalidUrl.value = !urlPattern.test(streamUrl.value);
  loading.value = !invalidUrl.value && streamUrl.value.length > 0;
};
</script>

<style scoped>
.camera-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 30px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background-color: #fafafa;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.input-area {
  margin-bottom: 1.5rem;
}

input {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  font-size: 1.1rem;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.video-area img {
  width: 100%;
  height: auto;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ccc;
}

.spinner-border {
  border-top-color: transparent;
}

.text-red-500 {
  color: #f56565;
}

.text-center {
  text-align: center;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-700 {
  color: #374151;
}
</style>
