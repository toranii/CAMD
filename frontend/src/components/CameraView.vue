<template>
  <div class="camera-container">
    <h2 class="page-title">🎥 카메라</h2>

    <div class="edit-control-box button-group">
      <template v-if="!editMode && !showRegisterBox">
        <button @click="startRegisterMode" class="common-btn register-btn">
          등록
        </button>
        <button @click="startEditMode" class="common-btn edit-btn">수정</button>
        <button @click="startDeleteMode" class="common-btn delete-btn">
          삭제
        </button>
      </template>
      <template v-else-if="editMode || showRegisterBox">
        <button @click="confirmAction" class="common-btn confirm-btn">
          확인
        </button>
        <button @click="cancelAction" class="common-btn cancel-btn">
          취소
        </button>
      </template>
    </div>

    <div v-if="showRegisterBox" class="register-box">
      <input
        v-model="newCameraUrl"
        type="text"
        placeholder="예: http://192.168.0.100/"
        class="input-url"
      />
      <p v-if="registrationError" class="error-msg">등록에 실패하였습니다.</p>
    </div>

    <div class="camera-view-section">
      <div class="stream-wrapper">
        <div class="stream-container" :style="streamContainerStyle">
          <div
            v-for="camera in cameras"
            :key="camera.id"
            class="stream-box"
            :class="{
              selected: isCameraSelected(camera.id),
              expanded: expandedCamera === camera.id,
            }"
            @click="handleCameraClick(camera.id)"
            v-show="!expandedCamera || expandedCamera === camera.id"
          >
            <img
              :src="camera.url"
              alt="ESP32-CAM 스트리밍"
              class="stream-img"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

let nextId = 0;
const cameras = ref([]);
const selectedCameras = ref([]);
const selectedCamera = ref(null);
const newCameraUrl = ref('');
const showRegisterBox = ref(false);
const registrationError = ref(false);
const editMode = ref(false);
const deleteMode = ref(false);
const expandedCamera = ref(null);
const windowWidth = ref(window.innerWidth);

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
});

const addCamera = () => {
  if (newCameraUrl.value.trim() === '') {
    registrationError.value = true;
    return;
  }
  cameras.value.push({ id: nextId++, url: newCameraUrl.value });
  newCameraUrl.value = '';
  showRegisterBox.value = false;
  registrationError.value = false;
  editMode.value = false;
};

const startRegisterMode = () => {
  showRegisterBox.value = true;
  editMode.value = false;
  deleteMode.value = false;
};

const isCameraSelected = (id) => {
  return deleteMode.value
    ? selectedCameras.value.includes(id)
    : selectedCamera.value === id;
};

const selectCamera = (id) => {
  if (editMode.value) {
    if (deleteMode.value) {
      if (selectedCameras.value.includes(id)) {
        selectedCameras.value = selectedCameras.value.filter((c) => c !== id);
      } else {
        selectedCameras.value.push(id);
      }
    } else {
      selectedCamera.value = selectedCamera.value === id ? null : id;
    }
  }
};

const toggleExpand = (id) => {
  if (!editMode.value && !showRegisterBox.value) {
    expandedCamera.value = expandedCamera.value === id ? null : id;
  }
};

const handleCameraClick = (id) => {
  toggleExpand(id);
  selectCamera(id);
};

const startEditMode = () => {
  editMode.value = true;
  deleteMode.value = false;
  showRegisterBox.value = false;
  selectedCamera.value = null;
};

const startDeleteMode = () => {
  deleteMode.value = true;
  editMode.value = true;
  showRegisterBox.value = false;
  selectedCameras.value = [];
};

const confirmAction = () => {
  if (deleteMode.value && selectedCameras.value.length === 0) return;
  if (editMode.value && selectedCamera.value === null && !deleteMode.value)
    return;
  if (showRegisterBox.value && newCameraUrl.value.trim() === '') return;

  if (deleteMode.value) {
    cameras.value = cameras.value.filter(
      (camera) => !selectedCameras.value.includes(camera.id),
    );
    alert('삭제되었습니다.');
    selectedCameras.value = [];
  } else if (editMode.value) {
    alert(`카메라 수정되었습니다.`);
    selectedCamera.value = null;
  } else if (showRegisterBox.value) {
    addCamera();
    return;
  }

  editMode.value = false;
  deleteMode.value = false;
  showRegisterBox.value = false;
};

const cancelAction = () => {
  editMode.value = false;
  deleteMode.value = false;
  showRegisterBox.value = false;
  selectedCamera.value = null;
  selectedCameras.value = [];
  expandedCamera.value = null;
};

const streamContainerStyle = computed(() => {
  if (expandedCamera.value !== null) {
    return { gridTemplateColumns: '1fr' };
  }
  const count = cameras.value.length;
  const width = windowWidth.value;
  if (count === 1) return { gridTemplateColumns: '1fr' };
  if (count === 2) return { gridTemplateColumns: '1fr 1fr' };
  if (count === 3 || count === 4)
    return { gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr' };
  if (count >= 5) {
    let cols = 2;
    if (width >= 1024) cols = 3;
    if (width >= 1400) cols = 4;
    return {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridAutoRows: 'minmax(200px, auto)',
    };
  }
  return { gridTemplateColumns: '1fr' };
});
</script>

<style scoped>
.camera-container {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #f9f9f9;
}

.page-title {
  font-size: 2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  color: #2d3748;
}

.input-url {
  width: 100%;
  padding: 10px;
  margin-top: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.common-btn {
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
}

.register-btn {
  background-color: #38b2ac;
  color: white;
}

.cancel-btn {
  background-color: #e53e3e;
  color: white;
}

.confirm-btn {
  background-color: #4a90e2;
  color: white;
}

.edit-btn {
  background-color: #4299e1;
  color: white;
}

.delete-btn {
  background-color: #e53e3e;
  color: white;
}

.stream-wrapper {
  margin-top: 30px;
}

.stream-container {
  display: grid;
  gap: 10px;
  margin-top: 20px;
}

.stream-box {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
  position: relative;
  background-color: white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stream-box:hover {
  transform: scale(1.01);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.stream-img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.selected {
  border: 2px solid #4fd1c5;
  opacity: 0.8;
}

.edit-control-box {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;
}

.camera-view-section {
  margin-top: 40px;
}

.expanded {
  grid-column: 1 / -1;
  z-index: 10;
}
</style>
