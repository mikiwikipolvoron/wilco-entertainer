import type { ClientEvent } from "@wilco/shared/events";
import { io, type Socket } from "socket.io-client";
import { create } from "zustand";

const SERVER_URL = "http://localhost:4000";
interface SocketStore {
	socket: Socket | null;
	connect: () => void;
	disconnect: () => void;
	emit: (event: string, data: ClientEvent) => void;
}

let socketInstance: Socket | null = null;

const useSocketStore = create<SocketStore>((set, get) => ({
	socket: null,

	connect: () => {
		if (socketInstance?.connected) {
			console.log("[Socket] Reusing existing connection");
			set({ socket: socketInstance });
			return;
		}

		if (socketInstance) {
			socketInstance.disconnect();
		}

		socketInstance = io(SERVER_URL);
		set({ socket: socketInstance });
	},

	disconnect: () => {
		if (socketInstance) {
			socketInstance?.disconnect();
			socketInstance = null;
			set({ socket: null });
		}
	},

	emit: (event, data) => {
		get().socket?.emit(event, data);
	},
}));

export { useSocketStore };
