import type React from "react";
import "./App.css";
import { useEffect } from "react";
import { useEntertainerActions } from "./lib/hooks/useEntertainerActions";
import { useServerSync } from "./lib/hooks/useServerSync";
import { useServerStore } from "./lib/stores/useServerStore";
import { useSocketStore } from "./lib/stores/useSocketStore";
import { getSessionIdFromUrl } from "./lib/utils/sessionId";
import ARScreen from "./screens/ARScreen";
import EnergizerScreen from "./screens/EnergizerScreen";
import InstrumentsScreen from "./screens/InstrumentsScreen";
import TapBeatsScreen from "./screens/TapBeatsScreen";
import LobbyView from "./views/LobbyView";
import StartView from "./views/StartView";

const Entertainer: React.FC = () => {
	const socket = useSocketStore();
	const currentActivity = useServerStore((s) => s.currentActivity);

	const entertainer = useEntertainerActions();

	useEffect(() => {
		socket.connect();
	}, [socket.socket?.connected]);

	useEffect(() => {
		entertainer.register();
		entertainer.requestState();
	}, [entertainer]);

	useServerSync();

	const sessionId = getSessionIdFromUrl();

	// If no session ID, show waiting screen
	if (!sessionId) {
		return (
			<div className="max-h-screen max-w-full p-4 w-full h-screen flex flex-col justify-center items-center text-center">
				<h1 className="text-2xl mb-4">WILCO Entertainer</h1>
				<p className="text-lg">Waiting for session...</p>
				<p className="text-sm mt-2 text-gray-500">
					Open this page with a session parameter:
					<br />
					<code>?session=YOUR_CODE</code>
				</p>
			</div>
		);
	}

	return (
		<div className="max-h-screen max-w-full p-0 w-full h-screen flex flex-col justify-center items-center text-center">
			{currentActivity === "start" && <StartView />}
			{currentActivity === "lobby" && <LobbyView />}
			{currentActivity === "beats" && <TapBeatsScreen />}
			{currentActivity === "ar" && <ARScreen />}
			{currentActivity === "instruments" && <InstrumentsScreen />}
			{currentActivity === "energizer" && <EnergizerScreen />}
		</div>
	);
};

export default Entertainer;
