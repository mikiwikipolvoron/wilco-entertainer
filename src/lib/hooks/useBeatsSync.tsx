import {
	SERVER_BEATS_EVENTS,
	type ServerEvent,
} from "@mikiwikipolvoron/wilco-lib/events";
import { useEffect } from "react";
import { useBeatsStore } from "../stores/useBeatsStore";
import { useSocketStore } from "../stores/useSocketStore";

export function useBeatsSync() {
	const socket = useSocketStore((state) => state.socket);

	useEffect(() => {
		if (!socket) return;

		function handleServerEvent(event: ServerEvent) {
			// Only handle beats-related events
			if (!SERVER_BEATS_EVENTS.some((et) => et === event.type)) return;

			console.log("[BeatsSync] Received event: ", event);

			switch (event.type) {
				case "beat_phase_change":
					console.log("[BeatsSync] Setting new phase: ", event.phase);
					useBeatsStore
						.getState()
						.setPhase(event.phase, event.round, event.bpm);
					break;

				case "beat_team_sync_update":
					useBeatsStore.getState().updateGroupAccuracies(event.groupAccuracies);
					break;

				case "beat_results":
					useBeatsStore
						.getState()
						.setResults(event.winner, event.groupAccuracies, event.mvp);
					break;
			}
		}

		socket.on("server_event", handleServerEvent);

		return () => {
			socket.off("server_event", handleServerEvent);
		};
	}, [socket]);
}
