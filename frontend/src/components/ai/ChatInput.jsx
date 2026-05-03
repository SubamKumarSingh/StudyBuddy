import { useState } from "react";

export default function ChatInput({ onSend }) {

  const [text, setText] = useState("");

  function handleSend() {

    if (!text.trim()) return;

    onSend(text);
    setText("");
  }

  return (

    <div style={{
      display: "flex",
      padding: 15,
      borderTop: "1px solid #ddd",
      background: "white"
    }}>

      <input
        style={{
          flex: 1,
          padding: 10,
          borderRadius: 6,
          border: "1px solid #ccc"
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask your AI study coach..."
      />

      <button
        onClick={handleSend}
        style={{
          marginLeft: 10,
          padding: "10px 18px",
          background: "#4a7cff",
          color: "white",
          border: "none",
          borderRadius: 6
        }}
      >
        Send
      </button>

    </div>
  );
}