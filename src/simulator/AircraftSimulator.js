import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Polyline, Marker, useMap } from "react-leaflet";
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
  const map = useMap();

  useEffect(() => {
    const generateFlights = () => {
      return flightRoutes.map((route) => {
        return {
          position: route.from,
          destination: route.to,
          speed: Math.random() * 0.01 + 0.01, // Random speed
          altitude: Math.random() * 30000 + 10000, // Random altitude between 10k-40k ft
        };
      });
    };

    const generateHelicopters = () => {
      return helicopterRoutes.map((route) => {
        return {
          center: route.center,
          radius: route.radius,
          loops: route.loops,
          angle: 0,
        };
      });
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
          return {
            ...plane,
            position: [plane.position[0] + deltaLat, plane.position[1] + deltaLng],
          };
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
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {aircraft.map((plane, index) => (
        <Marker key={index} position={plane.position} icon={aircraftIcon} />
      ))}
      {helicopters.map((heli, index) => (
        <Marker key={index} position={heli.position} icon={helicopterIcon} />
      ))}
    </>
  );
};

const AircraftMap = () => {
  return (
    <MapContainer center={[37.5, -122]} zoom={4} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <AircraftSimulator />
    </MapContainer>
  );
};

export default AircraftMap;
