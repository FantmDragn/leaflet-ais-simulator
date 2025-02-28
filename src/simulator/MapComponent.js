import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { AISSimulator } from "../simulator/AISSimulator";

const initialShips = [
  {
    id: 1,
    position: [51.505, -0.09],
    route: [
      [51.506, -0.091],
      [51.507, -0.092],
      [51.508, -0.093],
      [51.509, -0.094],
    ],
  },
  {
    id: 2,
    position: [51.500, -0.095],
    route: [
      [51.501, -0.096],
      [51.502, -0.097],
      [51.503, -0.098],
      [51.504, -0.099],
    ],
  },
];

export default function MapComponent() {
  const [ships, setShips] = useState(initialShips);
  const [simulator, setSimulator] = useState(null);

  useEffect(() => {
    const aisSim = new AISSimulator(ships, setShips);
    aisSim.startSimulation(2000); // Move ships every 2 seconds
    setSimulator(aisSim);

    return () => aisSim.stopSimulation(); // Cleanup on unmount
  }, []);

  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100vh", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {ships.map((ship) => (
        <Marker key={ship.id} position={ship.position}>
          <Popup>Ship ID: {ship.id}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
