import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISSimulator } from "./simulator/AISSimulator";
import AircraftSimulator from "./simulator/AircraftSimulator";
import { generateDetailedRoute, generateRandomRoutes } from "./utils/routeUtils";

const mapStyle = { height: "100vh", width: "100vw" };

// 🌊 Base routes - Move ships FARTHER offshore
const baseRoutes = [
  [
    { lat: 36.7749, lon: -127.4194 }, 
    { lat: 35.8508, lon: -126.5000 }, 
    { lat: 33.0522, lon: -123.2437 }, 
  ],
  [
    { lat: 39.7128, lon: -130.0060 }, 
    { lat: 38.2904, lon: -128.6122 }, 
    { lat: 37.9072, lon: -127.0369 }, 
  ],
];

// ✅ Generate multiple ships with varied routes
const routes = generateRandomRoutes(baseRoutes, 5); // 🚢 Create 5x more ships

const App = () => {
  const [ships, setShips] = useState([]);
  const [simulator, setSimulator] = useState(null);
  const [mapTheme, setMapTheme] = useState("dark"); // Toggle between dark and light maps

  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 2000));
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, setShips);
    setSimulator(aisSim);
  }, []);

  const toggleMapTheme = () => {
    setMapTheme(mapTheme === "dark" ? "light" : "dark");
  };

  return (
    <div>
      {/* Button to toggle map theme using an icon */}
      <button 
        onClick={toggleMapTheme} 
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "10px", 
          zIndex: 1000, 
          padding: "8px", 
          background: "white", 
          border: "1px solid #ccc", 
          borderRadius: "50%", 
          cursor: "pointer", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center"
        }}
      >
        🌍
      </button>

      <MapContainer center={[30, -90]} zoom={3} style={mapStyle}> {/* ✅ Full-screen map */}
        <TileLayer
          url={
            mapTheme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* 🚢 Render Ships */}
        {ships
          .filter((ship) => ship.latitude !== undefined && ship.longitude !== undefined)
          .map((ship) => (
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
                <b>Speed:</b> {ship.speedOverGround} knots
              </Popup>
            </CircleMarker>
        ))}

        {/* ✈️ ✅ Add Aircraft Simulation */}
        <AircraftSimulator mapTheme={mapTheme} />
      </MapContainer>
    </div>
  );
};

export default App;
