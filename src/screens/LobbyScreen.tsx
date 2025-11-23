import React from "react";

export default function LobbyScreen({ startBeats }: { startBeats: () => void }) {
  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "#FFD6E8", // pastel pink
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: "center",
      padding: "2rem",
      fontFamily: "system-ui",
    }}>
      <h1>Join to set the stage!</h1>
      <p>First task revealed in 1:00</p>

      <button
        onClick={startBeats}
        style={{
          padding: "1rem 2rem",
          fontSize: "1.2rem",
          marginTop: "1.5rem",
          cursor: "pointer"
        }}
      >
        Start Beats
      </button>
    </div>
  );
}
