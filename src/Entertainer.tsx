import type React from "react";
import "./App.css";
import { useActionState, useEffect } from "react";
import { useEntertainerActions } from "./lib/hooks/useEntertainerActions";
import { useServerSync } from "./lib/hooks/useServerSync";
import { useServerStore } from "./lib/stores/useServerStore";
import { useSocketStore } from "./lib/stores/useSocketStore";
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

	return (
		<div className="p-8 w-full h-screen flex flex-col justify-center items-center text-center">
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
