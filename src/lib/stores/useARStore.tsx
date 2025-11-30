import { create } from "zustand";
import type { ARPhase } from "@mikiwikipolvoron/wilco/data";

interface EntertainerARState {
	phase: ARPhase;
	totalTaps: number;
	tapsNeeded: number;
	bossHealth: number;
	bossMaxHealth: number;
	participatingPlayers: number;
	lastCollectedItemId: string | null;

	setPhase: (phase: ARPhase) => void;
	updateProgress: (totalTaps: number, tapsNeeded: number) => void;
	updateBossHealth: (health: number, maxHealth: number) => void;
	setItemCollected: (
		itemId: string,
		tapCount: number,
		tapsNeeded: number,
	) => void;
	setResults: (totalTaps: number, participatingPlayers: number) => void;
	reset: () => void;
}

export const useARStore = create<EntertainerARState>((set) => ({
	phase: "anchoring",
	totalTaps: 0,
	tapsNeeded: 0,
	bossHealth: 0,
	bossMaxHealth: 30,
	participatingPlayers: 0,
	lastCollectedItemId: null,

	setPhase: (phase) => set({ phase }),
	updateProgress: (totalTaps, tapsNeeded) => set({ totalTaps, tapsNeeded }),
	updateBossHealth: (health, maxHealth) =>
		set({ bossHealth: health, bossMaxHealth: maxHealth }),
	setItemCollected: (itemId, tapCount, tapsNeeded) =>
		set({ lastCollectedItemId: itemId, totalTaps: tapCount, tapsNeeded }),
	setResults: (totalTaps, participatingPlayers) =>
		set({ totalTaps, participatingPlayers }),
	reset: () =>
		set({
			phase: "anchoring",
			totalTaps: 0,
			tapsNeeded: 0,
			bossHealth: 0,
			participatingPlayers: 0,
			lastCollectedItemId: null,
		}),
}));
