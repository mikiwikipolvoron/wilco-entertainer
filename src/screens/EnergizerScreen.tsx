import type {
	EnergizerCell,
	EnergizerPattern,
	PlayerEnergy,
	ServerEvent,
} from "@mikiwikipolvoron/wilco-lib/events";
import { useEffect, useRef, useState } from "react";
import { useSocketStore } from "../lib/stores/useSocketStore";
import { useServerSync } from "../lib/hooks/useServerSync";

type Phase =
	| "instructions1"
	| "movement"
	| "send_energy"
	| "instructions2"
	| "sequence_show"
	| "sequence_input"
	| "results";

export default function EnergizerScreen() {
	const { connect, socket } = useSocketStore();

	const [phase, setPhase] = useState<Phase>("instructions1");
	const [slide, setSlide] = useState<{ text: string; slide: number; total: number }>();
	const [spotlight, setSpotlight] = useState(false);
	const [players, setPlayers] = useState<PlayerEnergy[]>([]);
	const [pattern, setPattern] = useState<EnergizerPattern | null>(null);
	const [patternVisible, setPatternVisible] = useState(false);
	const [sequenceResult, setSequenceResult] = useState<{
		success: boolean;
		correct: number;
		total: number;
	} | null>(null);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [audioBlocked, setAudioBlocked] = useState(false);
	useServerSync();

	useEffect(() => {
		connect();
	}, [connect]);

	useEffect(() => {
		if (!socket) return;

		const handleServerEvent = (event: ServerEvent) => {
			switch (event.type) {
				case "energizer_phase_change":
					setPhase(event.phase as Phase);
					if (event.phase !== "results") setSequenceResult(null);
					if (event.phase === "movement") {
						audioRef.current
							?.play()
							.then(() => setAudioBlocked(false))
							.catch(() => setAudioBlocked(true));
					} else {
						audioRef.current?.pause();
						if (audioRef.current) audioRef.current.currentTime = 0;
					}
					break;
				case "energizer_instruction":
					setSlide({
						text: event.text,
						slide: event.slide,
						total: event.totalSlides,
					});
					break;
				case "energizer_spotlight":
					setSpotlight(event.active);
					break;
				case "energizer_entertainer_update":
					setPlayers(event.players);
					break;
				case "energizer_sequence_show":
					setPattern(event.pattern);
					setPatternVisible(true);
					break;
				case "energizer_sequence_hide":
					setPatternVisible(false);
					break;
				case "energizer_sequence_result":
					setSequenceResult({
						success: event.success,
						correct: event.correctCount,
						total: event.totalParticipants,
					});
					break;
				default:
					break;
			}
		};

		socket.on("server_event", handleServerEvent);
		return () => {
			socket.off("server_event", handleServerEvent);
		};
	}, [socket]);

	return (
		<div className="w-full h-screen text-white bg-gradient-to-br from-slate-900 via-slate-950 to-black p-8 flex flex-col gap-6 overflow-hidden">
			<audio ref={audioRef} src="/audio/Midnight Sun.mp3" loop />
			{audioBlocked && phase === "movement" && (
				<button
					type="button"
					className="absolute top-6 left-6 px-4 py-2 rounded bg-yellow-400 text-black font-semibold shadow"
					onClick={() =>
						audioRef.current
							?.play()
							.then(() => setAudioBlocked(false))
							.catch(() => setAudioBlocked(true))
					}
				>
					Enable music
				</button>
			)}

			{(phase === "instructions1" || phase === "instructions2") && (
				<Instructions text={slide?.text ?? ""} />
			)}

			{phase === "movement" && (
				<MovementVisual players={players} spotlight={spotlight} />
			)}

			{phase === "send_energy" && <SendEnergyVisual />}

			{(phase === "sequence_show" || phase === "sequence_input") && (
				<SequenceVisual
					pattern={pattern}
					visible={patternVisible}
					waiting={phase === "sequence_input"}
				/>
			)}

			{sequenceResult && (
				<div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
					<div className="text-xl font-semibold">
						{sequenceResult.success ? "Pattern locked!" : "Try again"}
					</div>
					<div className="text-slate-200">
						Correct: {sequenceResult.correct}/{sequenceResult.total}
					</div>
				</div>
			)}
		</div>
	);
}

function Instructions({ text }: { text: string }) {
	return (
		<div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 text-3xl font-extrabold leading-snug tracking-tight flex items-center justify-center text-center">
			<div className="max-w-4xl">{text || "Awaiting instructions..."}</div>
		</div>
	);
}

function MovementVisual({
	players,
	spotlight,
}: {
	players: PlayerEnergy[];
	spotlight: boolean;
}) {
	const avgCharge =
		players.reduce((acc, p) => acc + p.charge, 0) / Math.max(players.length, 1);
	return (
		<div
			className={`flex-1 rounded-3xl relative overflow-hidden ${
				spotlight
					? "bg-yellow-300 border border-yellow-400"
					: "border border-cyan-200/20 bg-gradient-to-tr from-cyan-900/40 via-slate-900 to-slate-950"
			}`}
		>
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
				<div
					className={`text-5xl font-extrabold tracking-wide ${
						spotlight ? "text-black" : ""
					}`}
				>
					{spotlight ? "SPOTLIGHT BONUS" : "Charging..."}
				</div>
				<div className="w-full max-w-3xl h-5 rounded-full bg-white/20 overflow-hidden">
					<div
						className={`h-full ${spotlight ? "bg-black" : "bg-cyan-300"}`}
						style={{
							width: `${Math.min(100, avgCharge * 100)}%`,
							transition: "width 150ms ease-out",
						}}
					/>
				</div>
			</div>
		</div>
	);
}

function SendEnergyVisual() {
	return (
		<div className="flex-1 rounded-3xl border border-emerald-200/30 bg-gradient-to-br from-emerald-900/50 via-slate-900 to-slate-950 p-8 relative overflow-hidden">
			<div className="text-3xl font-semibold mb-4">Send the energy!</div>
			<div className="text-slate-200 mb-6">
				Players are swiping their charge to the stage.
			</div>
		</div>
	);
}

function SequenceVisual({
	pattern,
	visible,
	waiting,
}: {
	pattern: EnergizerPattern | null;
	visible: boolean;
	waiting: boolean;
}) {
	if (!pattern) {
		return (
			<div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8">
				Waiting for pattern...
			</div>
		);
	}

	return (
		<div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 space-y-4">
			<div className="flex justify-between items-center">
				<div className="text-2xl font-semibold">Memorize the pattern</div>
				<div className="text-sm text-slate-200">
					Colors: {["#ff63c3", "#ffa347", "#44a0ff", "#3ed17a"].join(", ")}
				</div>
			</div>
			<div
				className="grid gap-2"
				style={{
					gridTemplateColumns: `repeat(${pattern.cols}, minmax(0, 1fr))`,
				}}
			>
				{Array.from({ length: pattern.rows * pattern.cols }, (_, idx) => {
					const cell = pattern.cells.find((c: EnergizerCell) => c.index === idx);
					return (
						<div
							key={idx}
							className="aspect-square rounded-lg border border-white/10"
							style={{
								backgroundColor: visible
									? cell?.color ?? "rgba(255,255,255,0.08)"
									: "rgba(255,255,255,0.05)",
								opacity: visible ? 1 : 0.3,
							}}
						/>
					);
				})}
			</div>
			{waiting && (
				<div className="text-slate-200">Players are entering the pattern...</div>
			)}
		</div>
	);
}
