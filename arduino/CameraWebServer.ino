#include "esp_camera.h"
#include <WiFi.h>
#include <EEPROM.h>
#include "app_httpd.h"
#include <HTTPClient.h>
#include <ArduinoJson.h>

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

const char* ssid = "BigDATA-2.4G";
const char* password = "qlr!epdlxj!!";
const char* serverUrl = "http://192.168.0.11:5000/api/device/register";  // 백엔드 API 주소

#define EEPROM_SIZE 128
#define TOKEN_ADDR 0

String token;

String generateToken() {
  const char charset[] = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  String newToken = "";
  for (int i = 0; i < 32; i++) {
    newToken += charset[random(0, sizeof(charset) - 1)];
  }
  return newToken;
}

void registerDevice(String token) {
  if ((WiFi.status() == WL_CONNECTED)) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<300> doc;
    doc["mac"] = WiFi.macAddress();
    doc["token"] = token;
    doc["device_name"] = "MyESP32CAM";
    doc["ip_address"] = WiFi.localIP().toString();

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.println("[등록 요청 전송]");
    Serial.println(jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    Serial.printf("[서버 응답 코드] %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println("[서버 응답 본문]");
    Serial.println(response);

    http.end();
  } else {
    Serial.println("[오류] WiFi가 연결되지 않아 장치 등록 실패");
  }
}

void saveTokenToEEPROM(String tokenToSave) {
  EEPROM.begin(EEPROM_SIZE);
  for (int i = 0; i < tokenToSave.length(); i++) {
    EEPROM.write(TOKEN_ADDR + i, tokenToSave[i]);
  }
  EEPROM.write(TOKEN_ADDR + tokenToSave.length(), '\0');
  EEPROM.commit();
  EEPROM.end();
}

String readTokenFromEEPROM() {
  EEPROM.begin(EEPROM_SIZE);
  String loadedToken = "";
  for (int i = 0; i < 64; i++) {
    char c = EEPROM.read(TOKEN_ADDR + i);
    if (c == '\0') break;
    loadedToken += c;
  }
  EEPROM.end();
  return loadedToken;
}

void initCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_SVGA;
  config.jpeg_quality = 12;
  config.fb_count = 2;

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("[카메라 초기화 실패] 오류코드: 0x%x\n", err);
    return;
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  WiFi.begin(ssid, password);
  Serial.print("WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  delay(2000);
  Serial.println("\nWiFi connected!");
  Serial.println(WiFi.localIP());

  initCamera();

  token = readTokenFromEEPROM();
  if (token.length() == 0) {
    token = generateToken();
    saveTokenToEEPROM(token);
    Serial.println("[토큰 생성 및 저장 완료] " + token);
  } else {
    Serial.println("[저장된 토큰 사용] " + token);
  }

  Serial.println("[정보] ESP32는 토큰 발급기 역할만 수행합니다. 등록은 웹에서 처리됩니다.");

  registerDevice(token);

  startCameraServer();
  Serial.println("Camera Ready! Use '/stream' to view");
}

void loop() {
  delay(10000);
}
