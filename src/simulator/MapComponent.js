import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import { AISSimulator } from "../simulator/AISSimulator";
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
  const [simulator, setSimulator] = useState(null);
  const [detailedRoutes, setDetailedRoutes] = useState([]); // Store interpolated routes

  useEffect(() => {
    // Generate detailed routes (~15m spaced waypoints)
    const interpolatedRoutes = initialRoutes.map(route => generateDetailedRoute(route, 15, 2000));
    setDetailedRoutes(interpolatedRoutes); // Store the detailed routes

    // Initialize the AIS Simulator with detailed routes
    const aisSim = new AISSimulator(interpolatedRoutes, setShips, 2000);
    aisSim.startSimulation();
    setSimulator(aisSim);

    return () => aisSim.stopSimulation();
  }, []);

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

      {/* Draw correct detailed routes */}
      {detailedRoutes.map((route, index) => (
        <Polyline key={index} positions={route} color="blue" />
      ))}
    </MapContainer>
  );
}
{ships.map((ship) => {
  console.log(`Ship ${ship.id}:`, ship.latitude, ship.longitude); // Debugging

  return (
    <Marker
      key={ship.id}
      position={
        ship.latitude !== undefined && ship.longitude !== undefined
          ? [ship.latitude, ship.longitude]
          : [0, 0] // Default position to avoid crashes
      }
    >
      <Popup>
        <strong>Ship ID:</strong> {ship.id} <br />
        <strong>Heading:</strong> {ship.heading ? ship.heading.toFixed(1) : "Unknown"}°
      </Popup>
    </Marker>
  );
})}
