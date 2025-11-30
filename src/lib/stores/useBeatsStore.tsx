import { create } from "zustand";
import type { GroupAccuracy, BeatsPhase } from "@mikiwikipolvoron/wilco/data";

interface BeatsStore {
	// Current state
	phase: BeatsPhase;
	round: number;
	bpm: number;

	// Group performance data
	groupAccuracies: GroupAccuracy[];

	// Results
	winner: string | null;
	mvp: { playerId: string; nickname: string; accuracy: number } | null;

	// Actions
	setPhase: (phase: BeatsPhase, round: number, bpm: number) => void;
	updateGroupAccuracies: (groupAccuracies: GroupAccuracy[]) => void;
	setResults: (winner: string, groupAccuracies: GroupAccuracy[], mvp: { playerId: string; nickname: string; accuracy: number }) => void;
	reset: () => void;
}

const initialState = {
	phase: "instructions" as BeatsPhase,
	round: 0,
	bpm: 90,
	groupAccuracies: [],
	winner: null,
	mvp: null,
};

export const useBeatsStore = create<BeatsStore>((set) => ({
	...initialState,

	setPhase: (phase, round, bpm) => set({ phase, round, bpm }),

	updateGroupAccuracies: (groupAccuracies) => set({ groupAccuracies }),

	setResults: (winner, groupAccuracies, mvp) => set({
		phase: "results",
		winner,
		groupAccuracies,
		mvp
	}),

	reset: () => set(initialState),
}));
