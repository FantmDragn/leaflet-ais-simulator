import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100%" };


// Predefined ship routes
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

// Function to initialize ships on their routes
const generateShips = () => {
  return routes.map((route, index) => ({
    id: `ship-${index + 1}`,
    route,
    currentWaypoint: 0, // Start at the first waypoint
    latitude: route[0].lat,
    longitude: route[0].lon,
    speedOverGround: (Math.random() * 10 + 5).toFixed(2), // Random speed 5-15 knots
  }));
};

const Map = () => {
  const [ships, setShips] = useState(generateShips());

  useEffect(() => {
    const interval = setInterval(() => {
      setShips((prevShips) =>
        prevShips.map((ship) => {
          let nextWaypoint = ship.currentWaypoint + 1;
          if (nextWaypoint >= ship.route.length) {
            nextWaypoint = 0; // Loop back to start
          }

          return {
            ...ship,
            currentWaypoint: nextWaypoint,
            latitude: ship.route[nextWaypoint].lat,
            longitude: ship.route[nextWaypoint].lon,
          };
        })
      );
    }, 5000); // Move every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <MapContainer center={[37, -95]} zoom={4} style={mapStyle}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Simulated Ships Following Routes */}
      {ships.map((ship) => (
        <CircleMarker
          key={ship.id}
          center={[ship.latitude, ship.longitude]}
          radius={5} // Adjust the size of the dot
          color="white" // Outline color
          fillColor="white" // Fill color
          fillOpacity={1} // Make it solid
        >
          <Popup>
            <b>🚢 Simulated Ship {ship.id}</b><br />
            <b>Speed:</b> {ship.speedOverGround} knots
          </Popup>
        </CircleMarker>
      ))}

    </MapContainer>
  );
};

export default Map;
