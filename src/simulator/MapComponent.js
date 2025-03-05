import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { AISSimulator } from "../simulator/AISSimulator";
import { AircraftSimulator } from "../simulator/AircraftSimulator"; // ✅ Make sure this is correctly imported
import { generateDetailedRoute } from "../utils/routeUtils";

const initialRoutes = [
  [
    [51.000, -4.000], // Offshore start
    [51.500, -3.500],
    [52.000, -3.000],
    [52.500, -2.500],
    [53.000, -2.000], // End miles offshore
  ],
  [
    [50.500, -5.000], // Another offshore ship route
    [51.000, -4.500],
    [51.500, -4.000],
    [52.000, -3.500],
    [52.500, -3.000], // Farther offshore
  ],
];

export default function MapComponent() {
  const [ships, setShips] = useState([]);
  const [aircraft, setAircraft] = useState([]); // ✅ Add aircraft state
  const [simulator, setSimulator] = useState(null);
  const [detailedRoutes, setDetailedRoutes] = useState([]); // Store interpolated routes

  useEffect(() => {
    // Generate ship routes
    const detailedRoutes = initialRoutes.map(route => generateDetailedRoute(route, 15, 2000));
  
    console.log("🚀 Expanded Routes:", detailedRoutes);
  
    setDetailedRoutes(detailedRoutes);
  
    // Start AIS Simulation
    const aisSim = new AISSimulator(detailedRoutes, setShips, 2000);
    aisSim.startSimulation();
    setSimulator(aisSim);
  
    return () => aisSim.stopSimulation();
  }, []);

  useEffect(() => {
    // ✅ Start Aircraft Simulation Correctly
    const aircraftSim = new AircraftSimulator(setAircraft);
    aircraftSim.startSimulation();
    setSimulator(aircraftSim);

    return () => aircraftSim.stopSimulation();
  }, []); // ✅ Ensure it only runs once

  return (
    <MapContainer center={[51.505, -0.09]} zoom={7} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {ships.map((ship) => (
        <Marker key={ship.id} position={[ship.latitude, ship.longitude]}>
          <Popup>
            <strong>Ship ID:</strong> {ship.id} <br />
            <strong>Heading:</strong> {ship.heading.toFixed(1)}° 
          </Popup>
        </Marker>
      ))}

      {/* Draw ship routes */}
      {detailedRoutes.map((route, index) => (
        <Polyline key={index} positions={route} color="blue" />
      ))}

      {/* ✅ Render Aircraft Markers */}
      {aircraft.map((plane, index) => (
        <Marker key={index} position={plane.position}>
          <Popup>
            <strong>Altitude:</strong> {plane.altitude} ft <br />
            <strong>Speed:</strong> {plane.speed.toFixed(2)} knots
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
