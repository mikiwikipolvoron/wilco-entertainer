import React, { useEffect, useState } from "react";
import { getSocket } from "./lib/socket";
import { emitClientEvent } from "./lib/socket";
import { ServerState, ServerEvent } from "shared-types";
import "./App.css";

import LobbyScreen from "./screens/LobbyScreen";
import TapBeatsScreen from "./screens/TapBeatsScreen";
import ARScreen from "./screens/ARScreen";
import InstrumentsScreen from "./screens/InstrumentsScreen";
import EnergizerScreen from "./screens/EnergizerScreen";

const App: React.FC = () => {
  const [state, setState] = useState<ServerState | null>(null);
  const [currentScreen, setCurrentScreen] = useState<React.ReactNode>(
    <div>Connecting…</div>
  );

  // Trigger Beats: send event to server
  const startBeats = () => {
    emitClientEvent({ type: "request_start_beats" });
  };


  // Register entertainer & listen for server events
  useEffect(() => {
    emitClientEvent({ type: "register", role: "entertainer" });

    const handler = (event: ServerEvent) => {
      console.log("Received server event: ", event);
      if (event.type === "state_update") {
        setState(event.state);
      } else if (event.type === "activity_changed") {
        console.log("Activity changed to", event.activity);
      }
      // NOTE: we no longer handle "reaction" here.
      // LobbyScreen will subscribe to reactions itself.
    };


    const socket = getSocket();
    socket.on("server_event", handler);

    return () => {
      socket.off("server_event", handler);
    };
  }, []);

  // Decide which screen to render based on state.activity
  useEffect(() => {
    if (!state) {
      setCurrentScreen(<div>Connecting…</div> as React.ReactNode);
      return;
    }

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
      default:
        setCurrentScreen(<LobbyScreen startBeats={startBeats}/>);
        break;
    }

    console.log("Changed activity to: ", state.activity);
  }, [state]);

  return (
    <div className="p-8 w-full h-screen flex flex-col justify-center items-center text-center">
      {currentScreen}
    </div>
  );
};

export default App;
