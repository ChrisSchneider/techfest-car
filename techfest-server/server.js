const express = require("express");
const mqtt = require("mqtt");

const SERVO_MAX = 199;
const SPEED_MAX = 199;

const app = express();
var client = mqtt.connect("mqtt://10.25.14.105", {
  clientId: "tf_server"
});

var speed = 0,
  direction = 0;

function send(topic, motors) {
  const message = [
    motors.front_left,
    motors.front_right,
    motors.back_left,
    motors.back_right
  ]
    .map(number => ("00" + number).slice(-3))
    .join(" ");
  client.publish(topic, message);
}

function update() {
  let speedMotors = {
    front_left: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    front_right: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    back_left: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    back_right: Math.round((speed / 2 + 0.5) * SPEED_MAX)
  };
  let turnMotors = {
    front_left: Math.round((direction / 2 + 0.5) * SERVO_MAX),
    front_right: Math.round((direction / 2 + 0.5) * SERVO_MAX),
    back_left: Math.round((direction / 2 + 0.5) * SERVO_MAX),
    back_right: Math.round((direction / 2 + 0.5) * SERVO_MAX)
  };
  send("speed", speedMotors);
  send("turn", turnMotors);
}

app.get("/speed/:speed", (req, res) => {
  speed = parseFloat(req.params.speed);
  update();
  res.sendStatus(204);
});

app.get("/direction/:direction", (req, res) => {
  direction = parseFloat(req.params.direction);
  update();
  res.sendStatus(204);
});

client.on("connect", () => {
  console.log("Connected to MQTT");
  client.subscribe("speed");
  client.subscribe("turn");
});
client.on("disconnect", () => {
  console.log("Disconnected from MQTT");
});
client.on("message", (topic, message) => {
  console.log(topic, message.toString());
});

app.listen(4000);
