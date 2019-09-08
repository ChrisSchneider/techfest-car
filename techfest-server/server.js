const express = require("express");
const mqtt = require("mqtt");

const SERVO_MAX = 199;
const SPEED_MAX = 199;

const app = express();
var client = mqtt.connect("mqtt://10.25.14.53", {
  clientId: "tf_server_2"
});

var speed = 0,
  direction = 0,
  parallel = false,
  turn360 = false;

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

function calculate() {
  let speedMotors = {
    front_left: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    front_right: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    back_left: Math.round((speed / 2 + 0.5) * SPEED_MAX),
    back_right: Math.round((speed / 2 + 0.5) * SPEED_MAX)
  };
  let turnMotors = {
    front_left: Math.round((direction / 2 + 0.5) * SERVO_MAX),
    front_right: Math.round((direction / 2 + 0.5) * SERVO_MAX),
    back_left: Math.round((-direction / 2 + 0.5) * SERVO_MAX),
    back_right: Math.round((-direction / 2 + 0.5) * SERVO_MAX)
  };
  if (parallel) {
    turnMotors = {
      front_left: SERVO_MAX,
      front_right: SERVO_MAX,
      back_left: 0,
      back_right: 0
    };
    speedMotors.back_left = SPEED_MAX - speedMotors.back_left;
    speedMotors.back_right = SPEED_MAX - speedMotors.back_right;
  }
  if (turn360) {
    turnMotors = {
      front_left: 0.8 * SERVO_MAX,
      front_right: 0.2 * SERVO_MAX,
      back_left: 0.8 * SERVO_MAX,
      back_right: 0.2 * SERVO_MAX
    };
    speedMotors.front_right = SPEED_MAX - speedMotors.back_right;
    speedMotors.back_left = SPEED_MAX - speedMotors.back_left;
  }
  send("speed", speedMotors);
  send("turn", turnMotors);
  return {
    speedMotors,
    turnMotors
  };
}

app.get("/set/:speed/:direction/:parallel/:turn360", (req, res) => {
  speed = parseFloat(req.params.speed);
  direction = parseFloat(req.params.direction);
  parallel = req.params.parallel === "true";
  turn360 = req.params.turn360 === "true";
  const calc = calculate();
  res.send(calc);
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
