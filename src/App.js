import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISSimulator } from "./simulator/AISSimulator";
import AircraftSimulator from "./simulator/AircraftSimulator";
import { generateDetailedRoute, generateRandomRoutes } from "./utils/routeUtils";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };

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
  const [unknownShip, setUnknownShip] = useState({
    latitude: 10 + Math.random() * 20, // Random latitude in Pacific
    longitude: -160 + Math.random() * 40, // Random longitude in Pacific
    speedOverGround: (Math.random() * 5 + 3).toFixed(2), // Random speed
  });

  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 2000));
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, (updatedShips) => {
      setShips(updatedShips.map((ship, index) => {
        return {
          ...ship,
          heading: ship.heading || Math.floor(Math.random() * 360), // Ensure heading is set
          type: index % 2 === 0 ? shipTypes[index % shipTypes.length] : undefined,
          country: index % 2 === 0 ? Object.keys(countryFlags)[index % Object.keys(countryFlags).length] : undefined,
        };
      }));
    });
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
              radius={4}  // ✅ Smaller dots
              color="black"  // ✅ Black outline
              fillColor="white"
              fillOpacity={1}
              weight={1}  // ✅ Outline thickness
              stroke={true}
            >
              <Popup>
                <b>🚢 Simulated Ship {ship.id}</b><br />
                <b>Speed:</b> {ship.speedOverGround} knots<br />
                <b>Heading:</b> {ship.heading}°<br />
                {ship.type && ship.country && (
                  <>
                    <b>Type:</b> {ship.type}<br />
                    <b>Flag:</b> {countryFlags[ship.country]} {ship.country}
                  </>
                )}
              </Popup>
            </CircleMarker>
        ))}

        {/* 🚢 Add Unknown Ship in Pacific */}
        <CircleMarker
          center={[unknownShip.latitude, unknownShip.longitude]}
          radius={4}  // ✅ Slightly larger to differentiate
          color="black"  // ✅ Black outline
          fillColor="yellow"  // ✅ Unknown ship in yellow
          fillOpacity={1}
          weight={2}
          stroke={true}
        >
          <Popup>
            <b>🚢 Unknown Ship</b><br />
            <b>Speed:</b> {unknownShip.speedOverGround} knots
          </Popup>
        </CircleMarker>

        {/* ✈️ ✅ Add Aircraft Simulation */}
        <AircraftSimulator mapTheme={mapTheme} />
      </MapContainer>
    </div>
  );
};

export default App;
