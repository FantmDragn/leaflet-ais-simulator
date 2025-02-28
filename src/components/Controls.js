import React from "react";

const Controls = ({ onStart, onStop, isRunning }) => {
  return (
    <div style={{ textAlign: "center", margin: "10px" }}>
      <button onClick={onStart} disabled={isRunning} style={{ marginRight: "10px", padding: "10px" }}>
        Start Simulation
      </button>
      <button onClick={onStop} disabled={!isRunning} style={{ padding: "10px" }}>
        Stop Simulation
      </button>
    </div>
  );
};

export default Controls;
