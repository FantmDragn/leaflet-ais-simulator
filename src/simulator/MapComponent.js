import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import { AISSimulator } from "../simulator/AISSimulator";
import AircraftSimulator from "../simulator/AircraftSimulator"; 
import { generateDetailedRoute, generateRandomRoutes } from "../utils/routeUtils";
import "leaflet/dist/leaflet.css";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };

const baseRoutes = [
  [{ lat: 37.7749, lon: -122.4194 }, { lat: 35.8508, lon: -126.5000 }, { lat: 33.0522, lon: -123.2437 }],
  [{ lat: 39.7128, lon: -130.0060 }, { lat: 38.2904, lon: -128.6122 }, { lat: 37.9072, lon: -127.0369 }],
];

const routes = generateRandomRoutes(baseRoutes, 5); // 🚢 Create 5x more ships

export default function MapComponent() {
  const [ships, setShips] = useState([]);
  const [mapTheme, setMapTheme] = useState("dark");

  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 2000));
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

          return (
            <>
              <CircleMarker
                key={ship.id}
                center={[ship.latitude, ship.longitude]}
                radius={4}
                color="black"
                fillColor="white"
                fillOpacity={1}
                weight={1}
                stroke={true}
              >
                <Popup>
                  <b>🚢 Simulated Ship {ship.id}</b><br />
                  <b>Speed:</b> {ship.speedOverGround} knots<br />
                  <b>Heading:</b> {ship.heading}°<br />
                  <b>Type:</b> {ship.type}<br />
                  <b>Flag:</b> {countryFlags[ship.country]} {ship.country}
                </Popup>
              </CircleMarker>

              <Polyline
                positions={[[ship.latitude, ship.longitude], [endLat, endLng]]}
                color={mapTheme === "dark" ? "white" : "black"}
                weight={2}
              />
            </>
          );
        })}

        {/* ✈️ Aircraft Simulation */}
        <AircraftSimulator />
      </MapContainer>
    </div>
  );
}
