import React, { useEffect, useState } from "react";
import {QRCodeSVG} from "qrcode.react";
import { getSocket } from "../lib/socket";
import { ServerEvent } from "shared-types";

// Shape of a floating emoji
type FloatingEmoji = {
  id: number;
  emoji: string;
  x: number;
  y: number;
  drift: number;
  scale: number;
  duration: number;
  jitter: number;
};

  export default function LobbyScreen({ startBeats, isWaiting = false }: { startBeats: () => void; isWaiting?: boolean }) {
  const clientUrl = "http://192.168.0.7:5173";
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  // Timer (60 seconds)
  const [secondsLeft, setSecondsLeft] = useState(60);

    useEffect(() => {
      if (secondsLeft <= 0) return;

      const id = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Timer finished — trigger Beats and stop countdown
            startBeats();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(id);
    }, [secondsLeft, startBeats]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const countdownLabel = `${minutes}:${seconds.toString().padStart(2, "0")}`;


  // Local helper to spawn an emoji
  function spawnFloatingEmoji(emoji: string) {
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight - 50;

    setFloatingEmojis((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        emoji,
        x,
        y,
        drift: (Math.random() - 0.5) * 80,
        scale: 0.8 + Math.random() * 0.6, // between 0.8 and 1.4
        duration: 6.8 + Math.random() * 2.0, // e.g. 1.8s–3.3s
        jitter: (Math.random() - 0.5) * 20, // subtle horizontal wobble
      },
    ]);
  }

  // Subscribe to reaction events only while LobbyScreen is mounted
  useEffect(() => {
    const socket = getSocket();

    const handler = (event: ServerEvent) => {
      if (event.type === "reaction" && event.emoji) {
        spawnFloatingEmoji(event.emoji);
      }
    };

    socket.on("server_event", handler);

    return () => {
      socket.off("server_event", handler);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        background: isWaiting ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#FFD6E8", // purple gradient for waiting, pastel pink for initial
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "system-ui",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lobby core UI - different content based on waiting state */}
      {isWaiting ? (
        <>
          <h1 style={{ fontSize: "4rem", color: "white", marginBottom: "2rem", fontWeight: "bold" }}>
            Great job!
          </h1>
          <p style={{ fontSize: "2.5rem", color: "white", marginBottom: "1rem" }}>
            Next activity will start in
          </p>
          <div style={{
            fontSize: "6rem",
            color: "white",
            fontWeight: "bold",
            fontFamily: "monospace",
            textShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            {countdownLabel}
          </div>
        </>
      ) : (
        <>
          <h1>Join to set the stage!</h1>
          <p>First task revealed in <strong>{countdownLabel}</strong></p>
          <div className="m-6">
            <QRCodeSVG value={clientUrl} />
          </div>
          <p style={{ fontSize: "1rem" }}>
            Scan this QR code on your phone to join:
            <br />
            <code>{clientUrl}</code>
          </p>
        </>
      )}


      {/* Emoji animation keyframes */}
      <style>
        {`
        @keyframes floatUpDynamic {
          0% {
            transform: translate(var(--start-x), var(--start-y)) scale(var(--scale));
            opacity: 1;
          }
          100% {
            transform: translate(var(--start-x), calc(var(--start-y) - 1300px))
                      translateX(calc(var(--jitter) * 1px))
                      scale(var(--scale));
            opacity: 0;
          }
        }
      `}
      </style>

      {/* Floating emojis overlay, only active in lobby */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {floatingEmojis.map((item) => (
          <div
            key={item.id}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              fontSize: "3.5rem",
              transform: `translate(var(--start-x), var(--start-y))`,
              animation: `floatUpDynamic ${item.duration}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
              pointerEvents: "none",
              ["--start-x" as string]: `${item.x}px`,
              ["--start-y" as string]: `${item.y}px`,
              ["--scale" as string]: item.scale,
              ["--jitter" as string]: item.jitter,
            }}
          >
            {item.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}

