import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
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
    { lat: 37.7749, lon: -124.4194 }, 
    { lat: 36.7688, lon: -124.2201 }, 
    { lat: 32.8159, lon: -123.0756 }, 
  ],
  [
    { lat: 42.8388, lon: -125.3613 }, 
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
    speedOverGround: (Math.random() * 10 + 5).toFixed(2), // Random speed between 5-15 knots
    heading: Math.floor(Math.random() * 360), // Random heading
  });

  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 2000));
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, (updatedShips) => {
      setShips(updatedShips.map((ship, index) => {
        return {
          ...ship,
          speedOverGround: (Math.random() * 10 + 5).toFixed(2), // Random speed between 5-15 knots
          heading: ship.heading, // Keep the heading assigned in AISSimulator
          type: shipTypes[index % shipTypes.length],
          country: Object.keys(countryFlags)[index % Object.keys(countryFlags).length],
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

        {/* 🚢 Render Ships with Direction Lines */}
        {ships.map((ship, index) => {
            const lineLength = Math.min(0.01 * ship.speedOverGround, 0.1); // Adjust length based on speed, max 0.1
            const radianHeading = (ship.heading * Math.PI) / 180;
            const endLat = ship.latitude + lineLength * Math.cos(radianHeading);
            const endLng = ship.longitude + lineLength * Math.sin(radianHeading);

            return (
              
               <React.Fragment key={ship.id || `ship-${index}`}>
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
                    <b>Type:</b> {ship.type}<br />
                    <b>Flag:</b> {countryFlags[ship.country]} {ship.country}
                  </Popup>
                </CircleMarker>
                
                <Polyline
                  positions={[[ship.latitude, ship.longitude], [endLat, endLng]]}
                  color={mapTheme === "dark" ? "white" : "black"} // ✅ Line color based on theme
                  weight={2}
                />
                </React.Fragment>
              
            );
          })}

        {/* 🚢 Add Unknown Ship in Pacific */}
        <CircleMarker
          center={[unknownShip.latitude, unknownShip.longitude]}
          radius={5}
          color="black"
          fillColor="yellow"
          fillOpacity={1}
          weight={2}
          stroke={true}
        >
          <Popup>
            <b>🚢 Unknown Ship</b><br />
            <b>Speed:</b> {unknownShip.speedOverGround} knots<br />
            <b>Heading:</b> {unknownShip.heading}°
          </Popup>
        </CircleMarker>

        {/* ✈️ ✅ Add Aircraft Simulation */}
        <AircraftSimulator mapTheme={mapTheme} />
      </MapContainer>
    </div>
  );
};

export default App;
