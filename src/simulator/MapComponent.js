
// MapComponent.js - Renders the interactive map using React Leaflet.
// Displays ships, aircraft, and range rings for ship movement prediction.

// Import necessary dependencies
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, Popup } from "react-leaflet";
import { AISSimulator } from "../simulator/AISSimulator";
import AircraftSimulator from "../simulator/AircraftSimulator"; 
import { generateDetailedRoute, generateRandomRoutes } from "../utils/routeUtils";
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };

// Base Routes
const baseRoutes = [
  [{ lat: 37.7749, lon: -124.4194 }, { lat: 36.7688, lon: -124.2201 }, { lat: 34.8159, lon: -123.0756 }],
  [{ lat: 42.8388, lon: -125.3613 }, { lat: 38.2904, lon: -128.6122 }, { lat: 37.9072, lon: -127.0369 }],
];

// Generate randomized ship routes
const routes = generateRandomRoutes(baseRoutes, 7);

export default function MapComponent() {
  // State Variables
  const [ships, setShips] = useState([]);
  const [mapTheme, setMapTheme] = useState("dark");
  const [rangeRings, setRangeRings] = useState([]);
  const [selectedShipId, setSelectedShipId] = useState(null); // Track selected ship

  // Ensure React re-renders when rangeRings changes
  useEffect(() => {
    console.log("🟢 Range Rings Updated in State:", rangeRings);

    // Manually trigger a Leaflet map refresh if needed
    if (rangeRings.length > 0) {
      setTimeout(() => {
        setRangeRings([...rangeRings]); // Force React to re-render
        console.log("🔄 Manually refreshing Leaflet map.");
      }, 100);
    }
  }, [rangeRings]);

  // Initialize AIS Simulator
  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 500));
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, (updatedShips) => {
      setShips(updatedShips.map((ship, index) => ({
        ...ship,
        speedOverGround: (Math.random() * 10 + 5).toFixed(2),
        heading: Math.floor(Math.random() * 360),
        type: shipTypes[index % shipTypes.length],
        country: Object.keys(countryFlags)[index % Object.keys(countryFlags).length],
      })));
    });
  }, []);

  // Toggle Map Theme
  const toggleMapTheme = () => {
    setMapTheme(mapTheme === "dark" ? "light" : "dark");
  };

  // Calculate Range Rings for a Ship
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

    const newRings = timeIntervals.map((time, index) => {
      const distance = speedMetersPerSecond * time * 60; // Distance in meters
      const radianHeading = (heading * Math.PI) / 180;

      const newLat = latitude + (distance / 111320) * Math.cos(radianHeading);
      const newLon = longitude + (distance / (40075000 / 360)) * Math.sin(radianHeading);

      console.log(`🟠 Ring ${index + 1}: Lat=${newLat}, Lon=${newLon}, Radius=${distance}`);
      
      return { lat: newLat, lon: newLon, radius: distance, color: colors[index] };
    });

    console.log("🔴 Setting range rings state:", newRings);

    // Force React to recognize state change
    setRangeRings([]);  // Clear existing rings first
    setTimeout(() => {
      setRangeRings([...newRings]);
      console.log("🟢 Updated range rings in state:", [...newRings]);
    }, 100); // Delay ensures UI updates properly

    setSelectedShipId(ship.id);
  };

  return (
    <div>
      {/* Button to Toggle Map Theme */}
      <button 
        onClick={toggleMapTheme} 
        style={{ position: "absolute", top: "10px", right: "10px", zIndex: 1000, padding: "8px",
                 background: "white", border: "1px solid #ccc", borderRadius: "50%", cursor: "pointer" }}>
        🌍
      </button>

      <MapContainer center={[30, -90]} zoom={3} style={mapStyle}>
        <TileLayer
          url={mapTheme === "dark"
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* 🚢 Render Ships */}
        {ships.map((ship) => {
          return (
            <CircleMarker
              key={ship.id}
              center={[ship.latitude, ship.longitude]}
              radius={4}
              color="black"
              fillColor="white"
              fillOpacity={1}
              weight={1}
              stroke={true}
              eventHandlers={{ click: () => setSelectedShipId(ship.id) }}
            >
              <Popup>
                <b>🚢 Simulated Ship {ship.id}</b><br />
                <b>Speed:</b> {ship.speedOverGround} knots<br />
                <b>Heading:</b> {ship.heading}°<br />
                <b>Type:</b> {ship.type}<br />
                <b>Flag:</b> {countryFlags[ship.country]} {ship.country}<br />
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent popup from closing
                    calculateRangeRings(ship);
                  }} 
                  style={{ marginTop: "5px", padding: "6px", background: "#007BFF", color: "white",
                           border: "none", borderRadius: "5px", cursor: "pointer", width: "100%" }}>
                  Show Range Rings
                </button>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* ✅ Render Range Rings (Ensuring Execution) */}
        {rangeRings.length > 0 && selectedShipId && rangeRings.map((ring, index) => (
          <Circle key={index} center={[ring.lat, ring.lon]} radius={ring.radius}
                  pathOptions={{ color: ring.color, fillOpacity: 0.2 }} />
        ))}

        {/* ✈️ Aircraft Simulation */}
        <AircraftSimulator helicoptersAsAircraft={true} />
      </MapContainer>
    </div>
  );
}
