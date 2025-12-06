#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <Wire.h>
#include "MAX30105.h"   // SparkFun MAX3010x Library
#include "heartRate.h"

// ---------- Configuration ----------
const char* ssid = "TECNO CAMON 40 Pro 5G";
const char* password = "3nr7g96gnex89u3";
const char* serverName = "http://e-health-backend.eba-pwg4ni28.us-west-2.elasticbeanstalk.com/sensor-data";

// ---------- Pin Assignments ----------
const int AD8232_OUT_PIN = 34;  // ECG analog
const int ONE_WIRE_BUS = 4;     // DS18B20 data
const int SDA_PIN = 21;
const int SCL_PIN = 22;

// ---------- Objects ----------
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature ds18(&oneWire);
MAX30105 particleSensor;

// ---------- Heart rate variables ----------
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute = 0;
int beatAvg = 0;

// ---------- Function Declarations ----------
void setupWiFi();
void setupSensors();
float readECG();
float readTemperature();
void readMAX30102(float &ir, float &red, int &hr);
void sendDataToServer(float ecg, float temp, float ir, float red, int hr);

void setup() {
  Serial.begin(115200);
  delay(100);

  setupWiFi();
  setupSensors();
}

void loop() {
  float ecgValue = readECG();
  float temperature = readTemperature();

  float irValue = 0, redValue = 0;
  int heartRate = 0;

  readMAX30102(irValue, redValue, heartRate);
  sendDataToServer(ecgValue, temperature, irValue, redValue, heartRate);

  delay(5000);  // send every 5 seconds
}

// ------------------------------------------------------------
// Setup WiFi
// ------------------------------------------------------------
void setupWiFi() {
  Serial.print("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi Connected!");
}

// ------------------------------------------------------------
// Setup Sensors
// ------------------------------------------------------------
void setupSensors() {
  // ECG
  pinMode(AD8232_OUT_PIN, INPUT);
  analogReadResolution(12);

  // Temperature
  ds18.begin();

  // MAX30102
  Wire.begin(SDA_PIN, SCL_PIN);
  if (!particleSensor.begin()) {
    Serial.println("⚠️ MAX30102 not found. Check wiring!");
  } else {
    particleSensor.setup(); // default config
    particleSensor.setPulseAmplitudeRed(0x0A);
    particleSensor.setPulseAmplitudeIR(0x0A);
    Serial.println("✅ MAX30102 initialized.");
  }
}

// ------------------------------------------------------------
// ECG (AD8232)
// ------------------------------------------------------------
float readECG() {
  int raw = analogRead(AD8232_OUT_PIN);
  float voltage = (3.3 / 4095.0) * raw;
  Serial.print("ECG Voltage: ");
  Serial.println(voltage, 3);
  return voltage;
}

// ------------------------------------------------------------
// Temperature (DS18B20)
// ------------------------------------------------------------
float readTemperature() {
  ds18.requestTemperatures();
  float tempC = ds18.getTempCByIndex(0);
  if (tempC == DEVICE_DISCONNECTED_C) {
    Serial.println("⚠️ DS18B20 disconnected!");
    return NAN;
  }
  Serial.print("Temperature: ");
  Serial.println(tempC);
  return tempC;
}

// ------------------------------------------------------------
// MAX30102 (Heart Rate + Raw Values)
// ------------------------------------------------------------
void readMAX30102(float &ir, float &red, int &hr) {
  if (!particleSensor.begin()) return;

  long irValue = particleSensor.getIR();
  long redValue = particleSensor.getRed();

  if (checkForBeat(irValue)) {
    unsigned long delta = millis() - lastBeat;
    lastBeat = millis();
    beatsPerMinute = 60.0 / (delta / 1000.0);
    if (beatsPerMinute > 20 && beatsPerMinute < 200) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      long sum = 0;
      for (byte i = 0; i < RATE_SIZE; i++) sum += rates[i];
      hr = sum / RATE_SIZE;
    }
  }

  Serial.print("Heart Rate: ");
  Serial.print(hr);
  Serial.print(" BPM | IR: ");
  Serial.print(irValue);
  Serial.print(" | RED: ");
  Serial.println(redValue);

  ir = irValue;
  red = redValue;
}

// ------------------------------------------------------------
// Send JSON to Server
// ------------------------------------------------------------
void sendDataToServer(float ecg, float temp, float ir, float red, int hr) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi Disconnected. Skipping POST.");
    return;
  }

  StaticJsonDocument<512> doc;
  doc["patientId"] = "all";
  doc["ecgVoltage"] = ecg;
  doc["temperature"] = temp;
  doc["irValue"] = ir;
  doc["redValue"] = red;
  doc["heartRate"] = hr;
  doc["spo2"] = -1; // Placeholder (add later if needed)

  String jsonStr;
  serializeJson(doc, jsonStr);
  Serial.println("📤 Sending JSON: " + jsonStr);

  HTTPClient http;
  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(jsonStr);

  if (httpResponseCode > 0) {
    Serial.printf("✅ POST OK (%d): %s\n", httpResponseCode, http.getString().c_str());
  } else {
    Serial.printf("❌ POST failed: %d\n", httpResponseCode);
  }
  http.end();
}
