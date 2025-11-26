import type React from "react";
import { useEffect, useState } from "react";
import type { ServerEvent, ServerState } from "shared-types";
import { emitClientEvent, getSocket } from "./lib/socket";
import "./App.css";

import { useServerStore } from "./lib/stores/useServerStore";
import { useSocketStore } from "./lib/stores/useSocketStore";
import ARScreen from "./screens/ARScreen";
import EnergizerScreen from "./screens/EnergizerScreen";
import InstrumentsScreen from "./screens/InstrumentsScreen";
import LobbyScreen from "./screens/LobbyScreen";
import TapBeatsScreen from "./screens/TapBeatsScreen";

const AppLegacy: React.FC = () => {
	const [state, setState] = useState<ServerState | null>(null);
	const serverState = useServerStore();
	const sock = useSocketStore();
	const [currentScreen, setCurrentScreen] = useState<React.ReactNode>(
		<div>Connecting…</div>,
	);
	const [hasCompletedActivity, setHasCompletedActivity] = useState(false);

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
			setCurrentScreen((<div>Connecting…</div>) as React.ReactNode);
			return;
		}

		switch (state.activity) {
			case "beats":
				setHasCompletedActivity(true);
				setCurrentScreen(<TapBeatsScreen />);
				break;
			case "ar":
				setHasCompletedActivity(true);
				setCurrentScreen(<ARScreen />);
				break;
			case "instruments":
				setHasCompletedActivity(true);
				setCurrentScreen(<InstrumentsScreen />);
				break;
			case "energizer":
				setHasCompletedActivity(true);
				setCurrentScreen(<EnergizerScreen />);
				break;
			case "lobby":
			default:
				// Show waiting lobby if we've completed an activity
				setCurrentScreen(<LobbyScreen startBeats={startBeats} isWaiting={hasCompletedActivity} />);
				break;
		}

		console.log("Changed activity to: ", state.activity);
	}, [state, hasCompletedActivity]);

	return (
		<div className="p-8 w-full h-screen flex flex-col justify-center items-center text-center">
			{currentScreen}
		</div>
	);
};

export default AppLegacy;
