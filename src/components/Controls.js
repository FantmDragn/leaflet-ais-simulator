// Controls.js - Provides UI buttons to control the simulation.
// Includes start, stop, and reset buttons for managing the simulation state.

// Import necessary dependencies
import React from "react";

const Controls = ({ onStart, onStop, onReset, isRunning }) => {

// Render JSX elements
  return (
    <div style={{ textAlign: "center", margin: "10px" }}>
      <button onClick={onStart} disabled={isRunning} style={{ marginRight: "10px", padding: "10px" }}>
        Start Simulation
      </button>
      <button onClick={onStop} disabled={!isRunning} style={{ marginRight: "10px", padding: "10px" }}>
        Stop Simulation
      </button>
      <button onClick={onReset} style={{ padding: "10px" }}>
        Reset Simulation
      </button>
    </div>
  );
};

export default Controls;
