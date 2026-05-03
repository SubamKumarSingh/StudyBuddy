export default function MessageBubble({ message }) {

  const isUser = message.role === "user";

  return (

    <div style={{
      display: "flex",
      justifyContent: isUser ? "flex-end" : "flex-start",
      marginBottom: 12
    }}>

      <div style={{
        background: isUser ? "#4a7cff" : "#e9eefc",
        color: isUser ? "white" : "black",
        padding: "10px 14px",
        borderRadius: 10,
        maxWidth: 500
      }}>

        {message.content}

      </div>

    </div>
  );
}