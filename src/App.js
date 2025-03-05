import React from "react";
import MapComponent from "./MapComponent"; // Adjust the path if needed
import ChatBox from "./components/ChatBox"; // Ensure this is in the correct location

function App() {
  return (
    <div>
      <MapComponent />
      <ChatBox /> {/* ✅ Chatbox overlays the map properly */}
    </div>
  );
}

export default App;
