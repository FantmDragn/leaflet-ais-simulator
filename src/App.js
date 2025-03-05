import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { AISSimulator } from "./simulator/AISSimulator";
import AircraftSimulator from "./simulator/AircraftSimulator";
import { generateDetailedRoute, generateRandomRoutes } from "./utils/routeUtils";

const mapStyle = { height: "100vh", width: "100vw" };
const shipTypes = ["Container", "Tanker", "Cargo", "Passenger"];
const countryFlags = { USA: "🇺🇸", UK: "🇬🇧", China: "🇨🇳", Germany: "🇩🇪", Japan: "🇯🇵" };
const users = ["Captain Ahab", "Sailor Joe", "Navigator Kim", "Radio Op", "Deckhand Lee", "Chief Officer", "Engineer Max", "Quartermaster", "Lookout Sam", "Captain Rogers"];

// 🌊 Base routes - Move ships FARTHER offshore
const baseRoutes = [
  [
    { lat: 36.7749, lon: -127.4194 }, 
    { lat: 35.8508, lon: -126.5000 }, 
    { lat: 33.0522, lon: -123.2437 }, 
  ],
  [
    { lat: 39.7128, lon: -130.0060 }, 
    { lat: 38.2904, lon: -128.6122 }, 
    { lat: 37.9072, lon: -127.0369 }, 
  ],
];

// ✅ Generate multiple ships with varied routes
const routes = generateRandomRoutes(baseRoutes, 5); // 🚢 Create 5x more ships

const App = () => {
  const [ships, setShips] = useState([]);
  const [simulator, setSimulator] = useState(null);
  const [mapTheme, setMapTheme] = useState("dark"); // Toggle between dark and light maps
  const [unknownShip, setUnknownShip] = useState({
    latitude: 10 + Math.random() * 20,
    longitude: -160 + Math.random() * 40,
    speedOverGround: (Math.random() * 10 + 5).toFixed(2),
    heading: Math.floor(Math.random() * 360),
  });
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const detailedRoutes = routes.map(route => generateDetailedRoute(route, 15, 2000));
    console.log(`🚢 Generated ${detailedRoutes.length} ship routes`);

    const aisSim = new AISSimulator(detailedRoutes, (updatedShips) => {
      setShips(updatedShips.map((ship, index) => {
        return {
          ...ship,
          speedOverGround: (Math.random() * 10 + 5).toFixed(2),
          heading: Math.floor(Math.random() * 360),
          type: shipTypes[index % shipTypes.length],
          country: Object.keys(countryFlags)[index % Object.keys(countryFlags).length],
        };
      }));
    });
    setSimulator(aisSim);
  }, []);

  const toggleMapTheme = () => {
    setMapTheme(mapTheme === "dark" ? "light" : "dark");
  };

  const toggleChat = () => {
    setChatOpen(!chatOpen);
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setMessages([{ sender: user, text: "Ahoy! How’s the sea looking?" }]);
  };

  return (
    <div>
      <button 
        onClick={toggleMapTheme} 
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "50px", 
          zIndex: 1000, 
          padding: "8px", 
          background: "white", 
          border: "1px solid #ccc", 
          borderRadius: "50%", 
          cursor: "pointer", 
        }}
      >
        🌍
      </button>

      {/* Chat Icon */}
      <button 
        onClick={toggleChat} 
        style={{ 
          position: "absolute", 
          top: "10px", 
          right: "10px", 
          zIndex: 1000, 
          padding: "8px", 
          background: "white", 
          border: "1px solid #ccc", 
          borderRadius: "50%", 
          cursor: "pointer",
        }}
      >
        💬
      </button>

      {chatOpen && (
        <div style={{
          position: "absolute",
          top: "50px",
          right: "10px",
          width: "250px",
          height: "300px",
          background: "white",
          border: "1px solid #ccc",
          padding: "10px",
          zIndex: 1000,
          overflowY: "auto"
        }}>
          <h4>Chat</h4>
          {selectedUser ? (
            <div>
              <strong>Chat with {selectedUser}</strong>
              <div>
                {messages.map((msg, index) => (
                  <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
                ))}
              </div>
              <button onClick={() => setSelectedUser(null)}>Back</button>
            </div>
          ) : (
            <div>
              <strong>Select a user:</strong>
              {users.map(user => (
                <button key={user} onClick={() => selectUser(user)} style={{ display: "block", margin: "5px 0" }}>{user}</button>
              ))}
            </div>
          )}
        </div>
      )}

      <MapContainer center={[30, -90]} zoom={3} style={mapStyle}>
        <TileLayer
          url={mapTheme === "dark" ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
          attribution='&copy; OpenStreetMap contributors'
        />

        <AircraftSimulator mapTheme={mapTheme} />
      </MapContainer>
    </div>
  );
};

export default App;
