#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include "Adafruit_Crickit.h"
#include "seesaw_servo.h"
#include "seesaw_motor.h"

const char ssid[] = "TECHFEST";
const char password[] =  "techfest19";

#ifndef LED_BUILTIN
#define LED_BUILTIN 13
#endif

WiFiClient net;
PubSubClient client(net);

Adafruit_Crickit crickit;
seesaw_Servo servo_front_left(&crickit);
seesaw_Servo servo_front_right(&crickit);
seesaw_Servo servo_back_left(&crickit);
seesaw_Servo servo_back_right(&crickit);

void connect()
{
  digitalWrite(LED_BUILTIN, LOW);

  Serial.print("Checking Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
  }
  Serial.println("\nConnected to Wi-Fi\n");

  Serial.print("Connecting mqtt...");
  while (!client.connect("tf_arduino_turn", "try", "try")) {
    Serial.print(".");
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
  }

  Serial.println("\nConnected mqtt!\n");

  client.subscribe("turn");

  digitalWrite(LED_BUILTIN, HIGH);
}

void messageReceived(char* topic, byte* payload, unsigned int length)
{
  payload[length] = '\0';
  String message = String((char *)payload);

  if (strcmp(topic, "turn") >= 0) {
    int front_left = message.substring(0, 3).toInt();
    int front_right = message.substring(4, 7).toInt();
    int back_left = message.substring(8, 11).toInt();
    int back_right = message.substring(12, 15).toInt();
    
    Serial.print("Set direction: FL=");
    Serial.print(front_left);
    Serial.print(" FR=");
    Serial.println(front_right);
    Serial.print(" BL=");
    Serial.print(back_left);
    Serial.print(" BR=");
    Serial.println(back_right);

    servo_front_left.write(front_left);
    servo_front_right.write(front_right);
    servo_back_left.write(back_left);
    servo_back_right.write(back_right);
  }
}

void setup()
{
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);

  Serial.begin(9600);
  WiFi.begin(ssid, password);

  client.setServer("10.25.14.105", 1883);
  client.setCallback(messageReceived);

  connect();

  Serial.println("Connecting to crickit...");
  if(!crickit.begin()){
    Serial.println("Could not connect to crickit\n");
  }
  else {
    Serial.println("Connected to crickit!\n");
  }

  servo_front_left.attach(CRICKIT_SERVO1);
  servo_front_right.attach(CRICKIT_SERVO2);
  servo_back_left.attach(CRICKIT_SERVO3);
  servo_back_right.attach(CRICKIT_SERVO4);
}

void loop()
{
  client.loop();
  delay(10);
  
  if (!client.connected()) {
    connect();
  }
}
