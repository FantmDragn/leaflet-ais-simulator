// MapComponent.js - Renders the interactive map using React Leaflet.
// Displays ships, aircraft, and range rings for ship movement prediction.

// Import necessary dependencies

// React hooks for managing component state and side effects
import { useEffect, useState } from "react";

// Import necessary dependencies
import { MapContainer, TileLayer, Circle, CircleMarker, Polyline, Popup } from "react-leaflet";

// Import necessary dependencies
import { AISSimulator } from "../simulator/AISSimulator";

// Import necessary dependencies
import AircraftSimulator from "../simulator/AircraftSimulator"; 

// Import necessary dependencies
import { generateDetailedRoute, generateRandomRoutes } from "../utils/routeUtils";

// Import necessary dependencies
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };

const baseRoutes = [
  [{ lat: 37.7749, lon: -124.4194 }, { lat: 36.7688, lon: -124.2201 }, { lat: 34.8159, lon: -123.0756 }],
  [{ lat: 42.8388, lon: -125.3613 }, { lat: 38.2904, lon: -128.6122 }, { lat: 37.9072, lon: -127.0369 }],
];


// Define base routes and generate random ship routes
const routes = generateRandomRoutes(baseRoutes, 7);


// Function/Class definition
export default function MapComponent() {

// React hooks for managing component state and side effects
  const [ships, setShips] = useState([]);

// React hooks for managing component state and side effects
  const [mapTheme, setMapTheme] = useState("dark");

// React hooks for managing component state and side effects
  const [rangeRings, setRangeRings] = useState([]);

// React hooks for managing component state and side effects
  const [selectedShipId, setSelectedShipId] = useState(null);  // Track selected ship


// React hooks for managing component state and side effects
  useEffect(() => {

// Define base routes and generate random ship routes
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 500));

// Debugging output
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

  const toggleMapTheme = () => {
    setMapTheme(mapTheme === "dark" ? "light" : "dark");
  };

  const calculateRangeRings = (ship) => {

// Debugging output
    console.log(`Calculating range rings for ship: ${ship.id}`);
    const { latitude, longitude, speedOverGround, heading } = ship;
    const speedMetersPerSecond = speedOverGround * 0.51444; // Convert knots to m/s

    const timeIntervals = [5, 10, 15]; // Time in minutes
    const colors = ["blue", "green", "red"];

    const rings = timeIntervals.map((time, index) => {
      const distance = speedMetersPerSecond * time * 60; // Distance in meters
      const radianHeading = (heading * Math.PI) / 180;
      
      // Estimate new position (for illustrative purposes, we use distance only)
      const newLat = latitude + (distance / 111320) * Math.cos(radianHeading);
      const newLon = longitude + (distance / (40075000 / 360)) * Math.sin(radianHeading);

      return { lat: newLat, lon: newLon, radius: distance, color: colors[index] };
    });
    console.log("🔴 Setting range rings state:", rings);
    setRangeRings([...rings]);  // Ensure React re-renders by creating a new array
    setSelectedShipId(ship.id);  // Store selected ship ID
  

    setRangeRings(rings);
    setSelectedShipId(ship.id);
  };


// Render JSX elements
  return (
    <div>
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
          const lineLength = Math.min(0.01 * ship.speedOverGround, 0.1);
          const radianHeading = (ship.heading * Math.PI) / 180;
          const endLat = ship.latitude + lineLength * Math.cos(radianHeading);
          const endLng = ship.longitude + lineLength * Math.sin(radianHeading);

          {/* Render Range Rings */}
{rangeRings.length > 0 && selectedShipId && rangeRings.map((ring, index) => {
  console.log(`🔴 Rendering range ring ${index + 1} at ${ring.lat}, ${ring.lon}`);
  return (
    <Circle
      key={index}
      center={[ring.lat, ring.lon]}
      radius={ring.radius}
      pathOptions={{ color: ring.color, fillOpacity: 0.2 }}
    />
  );
})}



// Render JSX elements
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
              eventHandlers={{
                click: () => setSelectedShipId(ship.id),
              }}
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
                  style={{
                    marginTop: "5px",
                    padding: "6px",
                    background: "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Show Range Rings
                </button>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Render Range Rings */}
        {rangeRings.length > 0 && selectedShipId && rangeRings.map((ring, index) => {
          console.log(`🔴 Rendering range ring ${index + 1} at ${ring.lat}, ${ring.lon}`);
          return (
            <Circle
              key={index}
              center={[ring.lat, ring.lon]}
              radius={ring.radius}
              pathOptions={{ color: ring.color, fillOpacity: 0.2 }}
    />
  );
})}

        {/* ✈️ Aircraft Simulation */}
        <AircraftSimulator helicoptersAsAircraft={true} />
      </MapContainer>
    </div>
  );
}
