import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISSimulator } from "./simulator/AISSimulator";
import Controls from "./components/Controls";
import "react-leaflet-arrowheads";

const mapStyle = { height: "90vh", width: "100%" };

const routes = [
  [
    { lat: 37.7749, lon: -122.4194 },
    { lat: 36.8508, lon: -121.5000 },
    { lat: 34.0522, lon: -118.2437 },
  ],
  [
    { lat: 40.7128, lon: -74.0060 },
    { lat: 39.2904, lon: -76.6122 },
    { lat: 38.9072, lon: -77.0369 },
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

  const resetSimulation = () => {
    if (simulator) {
      simulator.resetSimulation();
      setIsRunning(false);
    }
  };

  return (
    <div>
      <Controls onStart={startSimulation} onStop={stopSimulation} onReset={resetSimulation} isRunning={isRunning} />

      <MapContainer center={[37, -95]} zoom={4} style={mapStyle}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Render Ship Trails */}
        {ships.map((ship) => (
          <Polyline key={`trail-${ship.id}`} positions={ship.trail} color="blue" weight={2} opacity={0.7} />
        ))}

        {/* Render Directional Arrows */}
        {ships.map((ship) => {
          if (ship.trail.length < 2) return null; // Skip if no movement history

          return (
            <Polyline
              key={`arrow-${ship.id}`}
              positions={[ship.trail[ship.trail.length - 2], [ship.latitude, ship.longitude]]}
              color="yellow"
              weight={3}
              arrowheads={{ size: "10px", frequency: "end-only", yawn: 30 }}
            />
          );
        })}

        {/* Render Ships as White Dots */}
        {ships.map((ship) => (
          <CircleMarker
            key={ship.id}
            center={[ship.latitude, ship.longitude]}
            radius={6}
            color="white"
            fillColor="white"
            fillOpacity={1}
            weight={2}
          >
            <Popup>
              <b>🚢 Simulated Ship {ship.id}</b><br />
              <b>Speed:</b> {ship.speedOverGround} knots<br />
              <b>Heading:</b> {ship.heading}°
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default App;
