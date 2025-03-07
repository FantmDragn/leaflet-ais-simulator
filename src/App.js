// App.js - Main entry point for the React application
// Handles map rendering, ship simulations, and theme toggling.

// Import necessary dependencies

// React hooks for managing component state and side effects
import React, { useEffect, useState } from "react";

// Import necessary dependencies
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";

// Import necessary dependencies
import "leaflet/dist/leaflet.css";

// Import necessary dependencies
import { AISSimulator } from "./simulator/AISSimulator";

// Import necessary dependencies
import AircraftSimulator from "./simulator/AircraftSimulator";

// Import necessary dependencies
import { generateDetailedRoute, generateRandomRoutes } from "./utils/routeUtils";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };

// 🌊 Base routes - Move ships FARTHER offshore
const baseRoutes = [
  [
    { lat: 37.7749, lon: -124.4194 }, 
    { lat: 36.7688, lon: -124.2201 }, 
    { lat: 34.8159, lon: -123.0756 }, 
  ],
  [
    { lat: 39.7128, lon: -130.0060 }, 
    { lat: 38.2904, lon: -128.6122 }, 
    { lat: 37.9072, lon: -127.0369 }, 
  ],
];

// ✅ Generate multiple ships with varied routes

// Define base routes and generate random ship routes
const routes = generateRandomRoutes(baseRoutes,7); // 🚢 Create 5x more ships

const App = () => {

// React hooks for managing component state and side effects
  const [ships, setShips] = useState([]);
  const [rangeRings, setRangeRings] = useState([]);  // Store calculated range rings
  const [selectedShipId, setSelectedShipId] = useState(null); // Store selected ship ID
  
// React hooks for managing component state and side effects
  const [simulator, setSimulator] = useState(null);

// React hooks for managing component state and side effects
  const [mapTheme, setMapTheme] = useState("dark"); // Toggle between dark and light maps

// React hooks for managing component state and side effects
  const [unknownShip, setUnknownShip] = useState({
    latitude: 10 + Math.random() * 20, // Random latitude in Pacific
    longitude: -160 + Math.random() * 40, // Random longitude in Pacific
    speedOverGround: (Math.random() * 10 + 5).toFixed(2), // Random speed between 5-15 knots
    heading: Math.floor(Math.random() * 360), // Random heading
  });


// React hooks for managing component state and side effects
  useEffect(() => {

// Define base routes and generate random ship routes
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 500));

// Debugging output
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, (updatedShips) => {
      setShips((prevShips) => {
        return updatedShips.map((ship, index) => {
          // Find the existing ship to preserve its speed
          const existingShip = prevShips.find(s => s.id === ship.id);
          return {
            ...ship,
          speedOverGround: existingShip ? existingShip.speedOverGround : (Math.random() * 10 + 5).toFixed(2), // Keep initial speed
          heading: ship.heading, // Keep the heading assigned in AISSimulator
          type: shipTypes[index % shipTypes.length],
          country: Object.keys(countryFlags)[index % Object.keys(countryFlags).length],
        };
      });
    });
  });
}, []);

  const toggleMapTheme = () => {
    setMapTheme(mapTheme === "dark" ? "light" : "dark");
  };

  const calculateRangeRings = (ship) => {
    console.log(`🟢 Calculating range rings for ship: ${ship.id}`);
    
    const { latitude, longitude, speedOverGround, heading } = ship;
    const speedMetersPerSecond = speedOverGround * 0.51444; // Convert knots to m/s

    if (!latitude || !longitude || !speedOverGround || !heading) {
      console.error("❌ Missing ship data:", ship);
      return;
    }
  
    const timeIntervals = [5, 10, 15]; // Time in minutes
    const colors = ["blue", "green", "red"];
  
    const rings = timeIntervals.map((time, index) => {
      const distance = speedMetersPerSecond * time * 60; // Distance in meters
      const radianHeading = (heading * Math.PI) / 180;
  
      const newLat = latitude + (distance / 111320) * Math.cos(radianHeading);
      const newLon = longitude + (distance / (40075000 / 360)) * Math.sin(radianHeading);
  
      console.log(`🟠 Ring ${index + 1}: Lat=${newLat}, Lon=${newLon}, Radius=${distance}`);
      
      return { lat: newLat, lon: newLon, radius: distance, color: colors[index] };
    });
  
    setRangeRings(rings);
    setSelectedShipId(ship.id);
  };
  

// Render JSX elements
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
            const lineLength = Math.min(0.001 * ship.speedOverGround, 0.01); // Adjust length based on speed, max 0.1
            const radianHeading = (ship.heading * Math.PI) / 180;
            const endLat = ship.latitude + lineLength * Math.cos(radianHeading);
            const endLng = ship.longitude + lineLength * Math.sin(radianHeading);


// Render JSX elements
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
                    <b>Flag:</b> {countryFlags[ship.country]} {ship.country}<br />


                    {/* Button to Show Range Rings */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent popup from closing
                        console.log("🔵 Button clicked for ship:", ship.id);
                        calculateRangeRings(ship); // Make sure this function is defined in `App.js`
                      }} 
                      style={{
                        marginTop: "5px",
                        padding: "6px",
                        background: "#007BFF",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        width: "100%",
                        fontSize: "14px",
                        textAlign: "center",
                      }}
                    >
                      Show Range Rings
                    </button>
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
