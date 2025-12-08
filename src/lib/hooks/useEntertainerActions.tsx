// hooks/useClientActions.ts - CLIENT ONLY
import type {
	ClientLobbyEvent,
	ClientServiceEvent,
} from "@mikiwikipolvoron/wilco-lib/events";
import { useSocketStore } from "../stores/useSocketStore";

export function useEntertainerActions() {
	const { socket } = useSocketStore();

	return {
		// Service actions
		register: () => {
			socket?.connect();
			const event: ClientServiceEvent = {
				type: "register",
				role: "entertainer",
			};
			socket?.emit("client_event", event);
		},

		requestState: () => {
			const event: ClientServiceEvent = { type: "request_state" };
			socket?.emit("client_event", event);
		},

		startBeats: () => {
			const event: ClientLobbyEvent = { type: "request_start_beats" };
			socket?.emit("client_event", event);
		},

		startAR: () => {
			const event: ClientLobbyEvent = { type: "request_start_ar" };
			socket?.emit("client_event", event);
		},

		startInstruments: () => {
			const event: ClientLobbyEvent = { type: "request_start_instruments" };
			socket?.emit("client_event", event);
		},

		startEnergizer: () => {
			const event: ClientLobbyEvent = { type: "request_start_energizer" };
			socket?.emit("client_event", event);
		},

		startOver: () => {
			const event: ClientLobbyEvent = { type: "request_start_over" };
			socket?.emit("client_event", event);
		},
	};
}
