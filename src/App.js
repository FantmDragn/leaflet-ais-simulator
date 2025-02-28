import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISSimulator } from "./simulator/AISSimulator";
import Controls from "./components/Controls"; // Import the new Controls component

const mapStyle = { height: "90vh", width: "100%" };

const routes = [
  [
    { lat: 37.7749, lon: -122.4194 }, // San Francisco
    { lat: 36.8508, lon: -121.5000 }, // Midpoint
    { lat: 34.0522, lon: -118.2437 }, // Los Angeles
  ],
  [
    { lat: 40.7128, lon: -74.0060 }, // New York
    { lat: 39.2904, lon: -76.6122 }, // Baltimore
    { lat: 38.9072, lon: -77.0369 }, // Washington D.C.
  ],
];

const App = () => {
  const [ships, setShips] = useState([]);
  const [simulator, setSimulator] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const aisSim = new AISSimulator(routes, setShips);
    setSimulator(aisSim);
    return () => aisSim.stopSimulation();
  }, []);

  const startSimulation = () => {
    if (simulator && !isRunning) {
      simulator.startSimulation();
      setIsRunning(true);
    }
  };

  const stopSimulation = () => {
    if (simulator && isRunning) {
      simulator.stopSimulation();
      setIsRunning(false);
    }
  };

  return (
    <div>
      <Controls onStart={startSimulation} onStop={stopSimulation} isRunning={isRunning} />

      <MapContainer center={[37, -95]} zoom={4} style={mapStyle}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {ships.map((ship) => (
          <CircleMarker
            key={ship.id}
            center={[ship.latitude, ship.longitude]}
            radius={5} // Adjust size if needed
            color="white" // Outline color
            fillColor="white" // Fill color
            fillOpacity={1} // Make it fully visible
            weight={1} // Ensure visible outline
          >
            <Popup>
              <b>🚢 Simulated Ship {ship.id}</b><br />
              <b>Speed:</b> {ship.speedOverGround} knots
            </Popup>
          </CircleMarker>

        ))}
      </MapContainer>
    </div>
  );
};

export default App;
