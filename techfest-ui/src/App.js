import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from "react";
import "./App.css";

function Wheel({ style, speed, turn }) {
  return (
    <div
      className="Wheel"
      style={{ ...style, transform: `rotate(${85 + turn * 0.95}deg)` }}
    >
      <div style={{ bottom: 100 - speed / 2 + "%" }} className="Speed"></div>
    </div>
  );
}

function Car({ calculation }) {
  return (
    <div className="Car">
      <Wheel
        style={{ left: 0, top: 0 }}
        speed={calculation.speedMotors.front_left}
        turn={calculation.turnMotors.front_left}
      />
      <Wheel
        style={{ right: 0, top: 0 }}
        speed={calculation.speedMotors.front_right}
        turn={calculation.turnMotors.front_right}
      />
      <Wheel
        style={{ right: 0, bottom: 0 }}
        speed={calculation.speedMotors.back_left}
        turn={calculation.turnMotors.back_left}
      />
      <Wheel
        style={{ left: 0, bottom: 0 }}
        speed={calculation.speedMotors.back_right}
        turn={calculation.turnMotors.back_right}
      />
    </div>
  );
}

function App() {
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(0);
  const [parallel, setParallel] = useState(false);
  const [turn360, setTurn360] = useState(false);
  const [calculation, setCalculation] = useState({
    speedMotors: {},
    turnMotors: {}
  });

  useEffect(() => {
    fetch(`/set/${speed}/${direction}/${parallel}/${turn360}`)
      .then(res => res.json())
      .then(setCalculation);
  }, [speed, direction, parallel, turn360]);

  useEffect(() => {
    document.onkeydown = event => {
      event = event || window.event;
      switch (event.keyCode) {
        case 38:
          setSpeed(speed + 0.05);
          break;
        case 40:
          setSpeed(speed - 0.05);
          break;
        case 37:
          setDirection(Math.max(direction - 0.05, -1));
          break;
        case 39:
          setDirection(Math.min(direction + 0.05, 1));
          break;
        default:
          break;
      }
    };
  });

  return (
    <div className="App">
      <div>
        <div>Speed: {speed.toString().substr(0, 4)}</div>
        <div>
          <Slider
            value={speed}
            onChange={setSpeed}
            min={-1}
            max={1}
            step={0.05}
            vertical={true}
            style={{ height: 100 }}
          />
        </div>
      </div>
      <br />
      <div>
        <div>Direction: {direction.toString().substr(0, 4)}</div>
        <div>
          <Slider
            value={direction}
            onChange={setDirection}
            min={-1}
            max={1}
            step={0.05}
            style={{ width: 200 }}
          />
        </div>
      </div>
      <div>
        <button
          onClick={() => {
            setParallel(!parallel);
            setTurn360(false);
            setSpeed(0);
          }}
        >
          Parallel parking {parallel ? "ON" : ""}
        </button>
        <button
          onClick={() => {
            setTurn360(!turn360);
            setParallel(false);
            setSpeed(0);
          }}
        >
          360° turn {turn360 ? "ON" : ""}
        </button>
      </div>
      <div>
        <Car calculation={calculation} />
      </div>
    </div>
  );
}

export default App;
