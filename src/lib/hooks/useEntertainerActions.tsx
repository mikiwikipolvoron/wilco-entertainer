// hooks/useClientActions.ts - CLIENT ONLY
import type { ClientServiceEvent } from "@wilco/shared/events";
import { useSocketStore } from "../stores/useSocketStore";

export function useEntertainerActions() {
	const socket = useSocketStore((s) => s.socket);

	return {
		// Service actions
		register: () => {
            socket?.connect();
			const event: ClientServiceEvent = {
				type: "register",
				role: 'entertainer',
			};
			socket?.emit("client_event", event);
		},

		requestState: () => {
			const event: ClientServiceEvent = { type: "request_state" };
			socket?.emit("client_event", event);
		},

        startBeats: () => {
            const event = { type: "request_start_beats"}
            socket?.emit("client_event", event);
        }

	};
}
