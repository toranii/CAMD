<template>
  <div class="settings-container">
    <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">
      설정 페이지
    </h2>
    <p class="text-gray-600">
      여기는 설정 페이지입니다. 나중에 추가할 설정을 여기에 넣을 수 있습니다.
    </p>
    <div class="mt-4">
      <label for="setting1" class="block text-gray-700">설정 1</label>
      <input
        type="text"
        id="setting1"
        placeholder="설정 항목 1"
        class="w-full p-2 mt-2 border border-gray-300 rounded-md"
      />
    </div>
    <div class="mt-4">
      <label for="setting2" class="block text-gray-700">설정 2</label>
      <input
        type="text"
        id="setting2"
        placeholder="설정 항목 2"
        class="w-full p-2 mt-2 border border-gray-300 rounded-md"
      />
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.settings-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}
</style>
