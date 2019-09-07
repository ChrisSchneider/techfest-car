import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [speed, setSpeed] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetch(`/speed/${speed}`);
  }, [speed]);

  useEffect(() => {
    fetch(`/direction/${direction}`);
  }, [direction]);

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
        <div>Speed: {speed}</div>
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
        <div>Direction: {direction}</div>
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
    </div>
  );
}

export default App;
