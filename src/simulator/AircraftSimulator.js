// AircraftSimulator.js - Handles the simulation of aircraft movement.
// Simulates aircraft flying between predefined airports and helicopters circling a location.

// Import necessary dependencies

// React hooks for managing component state and side effects
import { useState, useEffect } from "react";

// Import necessary dependencies
import { Marker, Popup } from "react-leaflet";

// Import necessary dependencies
import L from "leaflet";

// Define airport locations as coordinate arrays
const airports = {
  SEA: [47.4489, -122.3094],
  LAX: [33.9416, -118.4085],
  SAN: [32.7338, -117.1933],
  DEN: [39.8561, -104.6737],
  HNL: [21.3245, -157.925],
  SFO: [37.6213, -122.379],
};

// Define icons for aircraft and helicopters with black outlines for light mode
const aircraftIcon = (mapTheme) => L.divIcon({

// Function/Class definition
  className: "aircraft-icon",
  html: `<span style='color: white; -webkit-text-stroke: ${mapTheme === "light" ? "1px black" : "none"};'>▲</span>`,
  iconSize: [20, 20],
});

const helicopterIcon = (mapTheme) => L.divIcon({

// Function/Class definition
  className: "aircraft-icon",
  html: `<span style='color: white; -webkit-text-stroke: ${mapTheme === "light" ? "1px black" : "none"};'>▲</span>`,
  iconSize: [20, 20],
});

// Define flight routes between airports
const flightRoutes = [
  { from: airports.SEA, to: airports.HNL },
  { from: airports.SEA, to: airports.LAX },
  { from: airports.LAX, to: airports.SAN },
  { from: airports.LAX, to: airports.DEN },
  { from: airports.LAX, to: airports.HNL },
  { from: airports.SFO, to: airports.LAX },
];

// Define helicopter paths around LAX
const helicopterRoutes = [
  { center: { lat: airports.LAX[0], lng: airports.LAX[1] }, radius: 0.2, loops: 3 },
];

const AircraftSimulator = ({ mapTheme }) => {

// React hooks for managing component state and side effects
  const [aircraft, setAircraft] = useState([]);

// React hooks for managing component state and side effects
  const [helicopters, setHelicopters] = useState([]);


// React hooks for managing component state and side effects
  useEffect(() => {
    // Generate initial flights with structured position and destination objects
    const generateFlights = () => {
      return flightRoutes.map((route) => ({
        position: { lat: route.from[0], lng: route.from[1] }, // Convert array to object
        destination: { lat: route.to[0], lng: route.to[1] }, // Convert array to object
        speed: Math.random() * 0.0005 + 0.0003, // ✅ More realistic aircraft speed
        altitude: Math.random() * 30000 + 10000, // Random altitude between 10k-40k ft
      }));
    };

    // Generate initial helicopter routes
    const generateHelicopters = () => {
      return helicopterRoutes.map((route) => ({
        center: route.center,
        radius: route.radius,
        loops: route.loops,
        angle: 0, // Start angle for movement
        position: { lat: route.center.lat, lng: route.center.lng }, // Start at center
        speed: 0.0002, // ✅ More realistic helicopter speed
      }));
    };

    setAircraft(generateFlights());
    setHelicopters(generateHelicopters());
  }, []);


// React hooks for managing component state and side effects
  useEffect(() => {

// Set an interval to update simulation data periodically
    const interval = setInterval(() => {
      setAircraft((prevAircraft) =>
        prevAircraft.map((plane) => {
          if (!plane.position || !plane.destination) {
            console.error("❌ Missing position data for aircraft:", plane);
            return plane;
          }

          const deltaLat = (plane.destination.lat - plane.position.lat) * plane.speed;
          const deltaLng = (plane.destination.lng - plane.position.lng) * plane.speed;

          const newPosition = {
            lat: plane.position.lat + deltaLat,
            lng: plane.position.lng + deltaLng,
          };

          return { ...plane, position: newPosition };
        })
      );

      setHelicopters((prevHelicopters) =>
        prevHelicopters.map((heli) => {
          const newAngle = heli.angle + (360 / heli.loops) * 0.002; // ✅ Slower rotation
          const newLat = heli.center.lat + heli.radius * Math.cos(newAngle);
          const newLng = heli.center.lng + heli.radius * Math.sin(newAngle);
          return { ...heli, angle: newAngle, position: { lat: newLat, lng: newLng } };
        })
      );
    }, 1000);


// Render JSX elements
    return () => clearInterval(interval);
  }, []);


// Render JSX elements
  return (
    <>
      {/* Render aircraft only if they have valid lat/lng positions */}
      {aircraft
        .filter((plane) => plane.position && plane.position.lat !== undefined && plane.position.lng !== undefined)
        .map((plane, index) => (
          <Marker key={index} position={plane.position} icon={aircraftIcon(mapTheme)}>
            <Popup>
              <strong>Altitude:</strong> {plane.altitude} ft <br />
              <strong>Speed:</strong> {(plane.speed * 3600 * 69).toFixed(2)} MPH
            </Popup>
          </Marker>
        ))}

      {/* Render helicopters only if they have valid lat/lng positions */}
      {helicopters
        .filter((heli) => heli.position && heli.position.lat !== undefined && heli.position.lng !== undefined)
        .map((heli, index) => (
          <Marker key={index} position={heli.position} icon={helicopterIcon(mapTheme)}>
            <Popup>🚁 Helicopter</Popup>
          </Marker>
        ))}
    </>
  );
};

export default AircraftSimulator;