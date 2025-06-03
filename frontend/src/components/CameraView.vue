<template>
  <div class="camera-container">
    <h2 class="page-title">📷 카메라</h2>

    <div class="edit-control-box button-group">
      <template v-if="!editMode && !showRegisterBox">
        <button @click="startRegisterMode" class="common-btn register-btn">
          등록
        </button>
        <button
          @click="startEditMode"
          class="common-btn edit-btn"
          :disabled="cameras.length === 0"
        >
          수정
        </button>
        <button
          @click="startDeleteMode"
          class="common-btn delete-btn"
          :disabled="cameras.length === 0"
        >
          삭제
        </button>
      </template>
      <template v-else-if="editMode || showRegisterBox">
        <button
          @click="confirmAction"
          class="common-btn confirm-btn"
          :disabled="
            (deleteMode && selectedCameras.length === 0) ||
            (editMode && !deleteMode && selectedCamera === null) ||
            (showRegisterBox && newCameraIp.trim() === '')
          "
        >
          확인
        </button>
        <button @click="cancelAction" class="common-btn cancel-btn">
          취소
        </button>
      </template>
    </div>

    <div v-if="showRegisterBox" class="register-box">
      <input
        v-model="newCameraIp"
        type="text"
        placeholder="ESP32 IP 주소를 입력하세요 (예: 192.168.0.7)"
        class="input-url"
      />
      <p v-if="registrationError" class="error-msg">{{ registrationError }}</p>
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
import axios from 'axios';

const cameras = ref([]);
const selectedCameras = ref([]);
const selectedCamera = ref(null);
const newCameraIp = ref('');
const showRegisterBox = ref(false);
const registrationError = ref('');
const editMode = ref(false);
const deleteMode = ref(false);
const expandedCamera = ref(null);
const windowWidth = ref(window.innerWidth);

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth;
  });
  //fetchCameraList();
});

const fetchCameraList = async () => {
  try {
    const res = await axios.get('http://203.234.19.95:23918/api/device/list');
    if (res.data.success) {
      cameras.value = res.data.devices
        .filter((device) => device.ip_address)
        .map((device, idx) => ({
          id: idx,
          url: `http://${device.ip_address}:82/stream`,
          mac: device.mac_address,
          token: device.token,
          name: device.device_name,
        }));
    }
  } catch (err) {
    registrationError.value = '카메라 목록 불러오기 실패';
  }
};

const registerDevice = async () => {
  if (!newCameraIp.value.trim()) {
    registrationError.value = 'IP 주소를 입력하세요.';
    return;
  }

  if (cameras.value.some((c) => c.url.includes(newCameraIp.value))) {
    registrationError.value = '이미 등록된 장치입니다.';
    return;
  }

  try {
    // 1) 토큰 검증
    const { data: verify } = await axios.post(
      'http://203.234.19.95:23918/api/device/verify',
      { ip: newCameraIp.value },
    );
    if (!verify.success) {
      registrationError.value = verify.message || '장치 인증 실패';
      return;
    }

    // 2) DB 에 실제 등록
    const { data: reg } = await axios.post(
      'http://203.234.19.95:23918/api/device/register',
      {
        mac: verify.mac,
        token: verify.token,
        device_name: verify.deviceName,
        ip_address: newCameraIp.value,
      },
    );
    if (!reg.success) {
      registrationError.value = reg.message || 'DB 등록 실패';
      return;
    }

    // 3) 변경된 목록을 다시 불러오기
    await fetchCameraList();
    showRegisterBox.value = false;
    registrationError.value = '';
  } catch (err) {
    console.error(err);
    registrationError.value = '장치 등록 중 오류가 발생했습니다.';
  }
};

const startRegisterMode = () => {
  showRegisterBox.value = true;
  editMode.value = false;
  deleteMode.value = false;
};

const confirmAction = async () => {
  if (showRegisterBox.value) return registerDevice();

  if (deleteMode.value) {
    //try {
    //  await axios.post('http://203.234.19.95:23918/api/device/delete', {
    //    mac_addresses: deletedMacs,
    //  });
    // } catch (err) {
    //console.error('장치 삭제 요청 실패', err);
    //}

    cameras.value = cameras.value.filter(
      (camera) => !selectedCameras.value.includes(camera.id),
    );
    selectedCameras.value = [];
  } else if (editMode.value) {
    alert('카메라 수정 완료');
    selectedCamera.value = null;
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
  if (cameras.value.length === 0) return;
  editMode.value = true;
  deleteMode.value = false;
  showRegisterBox.value = false;
  selectedCamera.value = null;
};

const startDeleteMode = () => {
  if (cameras.value.length === 0) return;
  deleteMode.value = true;
  editMode.value = true;
  showRegisterBox.value = false;
  selectedCameras.value = [];
};

const streamContainerStyle = computed(() => {
  const count = cameras.value.length;
  const width = windowWidth.value;
  if (expandedCamera.value !== null) return { gridTemplateColumns: '1fr' };
  if (count === 1) return { gridTemplateColumns: '1fr' };
  if (count >= 2 && count <= 4)
    return { gridTemplateColumns: width < 600 ? '1fr' : '1fr 1fr' };
  if (count <= 9)
    return { gridTemplateColumns: width < 1024 ? '1fr 1fr' : '1fr 1fr 1fr' };
  if (count <= 24)
    return {
      gridTemplateColumns: width < 1400 ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr',
    };
  return { gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr' };
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
  transition: background-color 0.3s ease;
}

.common-btn:disabled {
  background-color: #e2e8f0;
  color: #a0aec0;
  cursor: not-allowed;
  border: 1px solid #cbd5e0;
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
