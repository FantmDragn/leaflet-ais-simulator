import { useState, useEffect } from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Define airport locations
const airports = {
  SEA: [47.4489, -122.3094],
  LAX: [33.9416, -118.4085],
  SAN: [32.7338, -117.1933],
  DEN: [39.8561, -104.6737],
  HNL: [21.3245, -157.925],
  SFO: [37.6213, -122.379],
};

// Aircraft icons
const aircraftIcon = L.divIcon({
  className: "aircraft-icon",
  html: "▲",
  iconSize: [20, 20],
});

const helicopterIcon = L.divIcon({
  className: "helicopter-icon",
  html: "🚁",
  iconSize: [20, 20],
});

// Flight paths with random variations
const flightRoutes = [
  { from: airports.SEA, to: airports.HNL },
  { from: airports.SEA, to: airports.LAX },
  { from: airports.LAX, to: airports.SAN },
  { from: airports.LAX, to: airports.DEN },
  { from: airports.LAX, to: airports.HNL },
  { from: airports.SFO, to: airports.LAX },
];

// Helicopter paths around LA
const helicopterRoutes = [
  { center: airports.LAX, radius: 0.2, loops: 3 },
];

const AircraftSimulator = () => {
  const [aircraft, setAircraft] = useState([]);
  const [helicopters, setHelicopters] = useState([]);

  useEffect(() => {
    // Generate initial aircraft and helicopters
    const generateFlights = () => {
      const flights = flightRoutes.map((route) => ({
        position: route.from,
        destination: route.to,
        speed: Math.random() * 0.01 + 0.01, // Random speed
        altitude: Math.random() * 30000 + 10000, // Random altitude
      }));
    console.log("✈️ Generated flights:", flights); // ✅ Log aircraft generation
    return flights;     
    };

    const generateHelicopters = () => {
      return helicopterRoutes.map((route) => ({
        center: route.center,
        radius: route.radius,
        loops: route.loops,
        angle: 0,
      }));
    };


    setAircraft(generateFlights());
    setHelicopters(generateHelicopters());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAircraft((prevAircraft) =>
        prevAircraft.map((plane) => {
          const deltaLat = (plane.destination[0] - plane.position[0]) * plane.speed;
          const deltaLng = (plane.destination[1] - plane.position[1]) * plane.speed;
          const newPosition = [plane.position[0] + deltaLat, plane.position[1] + deltaLng];

          return { ...plane, position: newPosition };
        })
      );

      setHelicopters((prevHelicopters) =>
        prevHelicopters.map((heli) => {
          const newAngle = heli.angle + (360 / heli.loops) * 0.02;
          const newLat = heli.center[0] + heli.radius * Math.cos(newAngle);
          const newLng = heli.center[1] + heli.radius * Math.sin(newAngle);
          return { ...heli, angle: newAngle, position: [newLat, newLng] };
        })
      );
    }, 1000);

    return () => clearInterval(interval); // ✅ Cleanup interval
  }, []);

  return (
    <>
      {aircraft.map((plane, index) => (
        <Marker key={index} position={plane.position} icon={aircraftIcon}>
          <Popup>
            <strong>Altitude:</strong> {plane.altitude} ft <br />
            <strong>Speed:</strong> {plane.speed.toFixed(2)} knots
          </Popup>
        </Marker>
      ))}

      {helicopters.map((heli, index) => (
        <Marker key={index} position={heli.position} icon={helicopterIcon}>
          <Popup>🚁 Helicopter</Popup>
        </Marker>
      ))}
    </>
  );
};

export default AircraftSimulator;
