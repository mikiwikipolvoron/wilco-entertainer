import { useEffect } from "react";
import { useSocketStore } from "../stores/useSocketStore";
import { useARStore } from "../stores/useARStore";
import type { ServerEvent } from "@wilco/shared/events";

export function useARSync() {
	const socket = useSocketStore((state) => state.socket);

	useEffect(() => {
		if (!socket) return;

		function handleServerEvent(event: ServerEvent) {
			console.log("[EntertainerARSync] Received event:", event);

			switch (event.type) {
				case "ar_phase_change":
					useARStore.getState().setPhase(event.phase);
					break;

				case "ar_boss_health":
					useARStore.getState().updateBossHealth(event.health, event.maxHealth);
					break;

				case "ar_item_collected":
					useARStore
						.getState()
						.setItemCollected(event.itemId, event.tapCount, event.tapsNeeded);
					break;

				case "ar_results":
					useARStore
						.getState()
						.setResults(event.totalTaps, event.participatingPlayers);
					break;
			}
		}

		socket.on("server_event", handleServerEvent);

		return () => {
			socket.off("server_event", handleServerEvent);
		};
	}, [socket]);
}
