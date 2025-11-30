import type {
    ActivityId,
    GroupDefinitions,
    Player,
    ServerState,
} from "@mikiwikipolvoron/wilco-lib/data";
import { create } from "zustand";

interface ServerStore extends ServerState {
    // Server-side values
    currentActivity: ActivityId;
    players: Record<string, Player>;
    groups?: GroupDefinitions;
    connected: boolean;

    // Client-side values, updated and tracked by us
    nickname?: string;
    registered: boolean;
    assignedGroup?: string;

    _handlePlayerJoined: (player: Player) => void;
    _handlePlayerLeft: (playerId: string) => void;
    _handleActivityStarted: (activity: ActivityId) => void;
    _handleGroupsUpdated: (groups: GroupDefinitions) => void;
    _setConnected: (connected: boolean) => void;
}

const initialState = {
    currentActivity: "start" as ActivityId,
    players: {},
    groups: undefined,
    connected: false,
    nickname: undefined,
    registered: false,
    assignedGroup: undefined,
};

export const useServerStore = create<ServerStore>((set) => ({
    ...initialState,

    _handlePlayerJoined: (player) => set((state) => ({
        players: { ...state.players, [player.id]: player },
    })),

    _handlePlayerLeft: (playerId) => set((state) => {
        const { [playerId]: _removed, ...players } = state.players;
        return { players };
    }),

    _handleActivityStarted: (activity) => set({ currentActivity: activity }),

    _handleGroupsUpdated: (groups) => set({ groups }),

    _setConnected: (connected) => set({ connected }),
}))
