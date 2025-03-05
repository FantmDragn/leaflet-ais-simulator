import { useState } from "react";

const users = [
  "Captain Jack", "Navigator Sarah", "Deckhand Tom", "Engineer Mike", 
  "Radio Officer Jane", "Chief Officer Dave", "Pilot Joe", "Sailor Rick", 
  "First Mate Anne", "Commander Steve"
];

const fakeResponses = [
  "Aye, aye! What's the update?",
  "Roger that. Stay the course!",
  "Checking the radar, all clear.",
  "Wind’s picking up, keep an eye on it.",
  "Got it! Updating the logs now."
];

export default function ChatBox() {
  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { user: "You", text: input }];
    
    // Simulated response after a short delay
    setTimeout(() => {
      const response = fakeResponses[Math.floor(Math.random() * fakeResponses.length)];
      setMessages((prev) => [...prev, { user: selectedUser, text: response }]);
    }, 1000);
    
    setMessages(newMessages);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5">
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-md"
      >
        {isOpen ? "Close Chat" : "Open Chat"}
      </button>

      {/* Chat Box */}
      {isOpen && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-72 mt-2">
          <h3 className="text-lg font-bold">Chat with {selectedUser}</h3>
          <select
            className="w-full bg-gray-700 text-white p-1 rounded my-2"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            {users.map((user) => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <div className="h-40 overflow-y-auto bg-gray-700 p-2 rounded">
            {messages.map((msg, i) => (
              <div key={i} className={`p-1 my-1 rounded ${msg.user === "You" ? "bg-blue-500 text-right" : "bg-gray-600"}`}>
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              className="flex-1 p-2 bg-gray-700 rounded-l"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button className="bg-blue-600 px-3 rounded-r" onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}
