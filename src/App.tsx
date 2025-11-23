import React, { useEffect, useState } from 'react';
import { getSocket } from "./lib/socket";
import { emitClientEvent } from "./lib/socket";
import { ServerState, ServerEvent, Player } from 'shared-types';
import './App.css';
import LobbyScreen from "./screens/LobbyScreen";
import TapBeatsScreen from "./screens/TapBeatsScreen";
import ARScreen from "./screens/ARScreen";
import InstrumentsScreen from "./screens/InstrumentsScreen";
import EnergizerScreen from "./screens/EnergizerScreen";




const App: React.FC = () => {
  const [state, setState] = useState<ServerState | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<
      {
        id: number;
        emoji: string;
        x: number;
        y: number;
        drift: number;
        scale: number;
        duration: number;
        jitter: number;
      }[]
    >([]);




    function spawnFloatingEmoji(emoji: string) {
      const x = Math.random() * window.innerWidth;
      const y = window.innerHeight - 50;

      setFloatingEmojis(prev => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          emoji,
          x,
          y,
          drift: (Math.random() - 0.5) * 80,
          scale: 0.8 + Math.random() * 0.6,     // between 0.8 and 1.4
          duration: 6.8 + Math.random() * 2.0,  // between 1.8s and 3.3s
          jitter: (Math.random() - 0.5) * 20    // subtle horizontal wobble
        }
      ]);
    }
  

    useEffect(() => {
      emitClientEvent({ type: "register", role: "entertainer" });

      const handler = (event: ServerEvent) => {
        console.log("Received server event: ", event);
        if (event.type === "state_update") {
          setState(event.state);
        } else if (event.type === "activity_changed") {
          console.log("Activity changed to", event.activity);
        } else if (event.type === "reaction") {
          spawnFloatingEmoji(event.emoji);
        }
      };

      const socket = getSocket();
      socket.on("server_event", handler);

      return () => {
        socket.off("server_event", handler);
      };
    }, []);

  const startBeats = () => {
    emitClientEvent({ type: 'request_start_beats' });
  };

  const [currentScreen, setCurrentScreen] = useState(<div>Connecting...</div>);

  useEffect(() => {
    if (!state) {
      setCurrentScreen(<div>Connecting…</div>)
    } else {
      switch (state.activity) {
        case "beats":
          setCurrentScreen(<TapBeatsScreen />);
          break;
        case "ar":
          setCurrentScreen(<ARScreen />);
          break;
        case "instruments":
          setCurrentScreen(<InstrumentsScreen />);
          break;
        case "energizer":
          setCurrentScreen(<EnergizerScreen />);
          break;
        case "lobby":
          setCurrentScreen(<LobbyScreen startBeats={startBeats} />);
          break;
      }
      console.log("Changed activity to: ", state.activity);
    }
  }, [state])

  return (
    <div className='p-8 w-full h-screen flex flex-col justify-center items-center text-center'>
      {currentScreen}
{/*       
      <h1 >Join to set the stage!</h1>
      <p>First task revealed in 1:00</p>

      {state.activity === 'lobby' && (
        <button onClick={startBeats} style={{ padding: '1rem', fontSize: '1.2rem' }}>
          Start Beats
        </button>
      )} */}
      {<style>
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
      </style>}


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
            ["--start-x" as any]: `${item.x}px`,
            ["--start-y" as any]: `${item.y}px`,
            ["--scale" as any]: item.scale,
            ["--jitter" as any]: item.jitter,
          }}
        >
          {item.emoji}
        </div>
      ))}
      </div>
    </div>
  );
};

export default App;
