import type {
	EnergizerCell,
	EnergizerPattern,
	PlayerEnergy,
	ServerEvent,
} from "@mikiwikipolvoron/wilco-lib/events";
import { useEffect, useRef, useState } from "react";
import BlurryBox from "../lib/components/BlurryBox";
import { useServerSync } from "../lib/hooks/useServerSync";
import { useSocketStore } from "../lib/stores/useSocketStore";

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
	const [slide, setSlide] = useState<{
		text: string;
		slide: number;
		total: number;
	}>();
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
		<div className="w-full h-screen">
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
				<BlurryBox rounded={true} padding={4}>
					<div className="text-xl font-semibold">
						{sequenceResult.success ? "Pattern locked!" : "Try again"}
					</div>
					<div className="text-slate-200">
						Correct: {sequenceResult.correct}/{sequenceResult.total}
					</div>
				</BlurryBox>
			)}
		</div>
	);
}

function Instructions({ text }: { text: string }) {
	return (
		<div className="flex-1 border-0 bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 p-8 text-5xl font-extrabold flex items-center justify-center text-center w-full h-screen">
			<BlurryBox text={text || "Awaiting instructions..."} />
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
			className={`flex rounded-3xl  overflow-hidden ${
				spotlight
					? "bg-yellow-300 border-none border-yellow-400"
					: "border border-cyan-200/20 bg-linear-to-tr from-cyan-900/40 via-slate-900 to-slate-950"
			}`}
		>
			<div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
				<div
					className={`text-5xl font-extrabold tracking-wide ${
						spotlight ? "text-black" : ""
					}`}
				>
					{spotlight ? "SPOTLIGHT BONUS" : "Charging..."}
				</div>
				<BlurryBox className="max-w-3xl h-5 rounded-full bg-white/20 overflow-hidden">
					<div
						className={`h-full ${spotlight ? "bg-black" : "bg-cyan-300"}`}
						style={{
							width: `${Math.min(100, avgCharge * 100)}%`,
							transition: "width 150ms ease-out",
						}}
					/>
				</BlurryBox>
			</div>
		</div>
	);
}

function SendEnergyVisual() {
	return (
		<div className="w-full h-screen border-0 bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 font-extrabold flex-col items-center justify-center text-center">
			<div className="max-w-4xl flex flex-col items-center justify-center text-center">
				<p className="text-6xl font-semibold">Send the energy!</p>
				<p className="text-slate-200 text-2xl">
					Players are swiping their charge to the stage.
				</p>
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
		<div className="flex-row w-full max-h-full rounded-3xl border border-white/10 bg-white/5 p-2 overflow-hidden">
			<div className="flex text-center flex-col justify-between items-center p-2">
				<div className="text-2xl font-semibold">Memorize the pattern</div>
				<div className="text-sm text-slate-200">
					Colors: {["#ff63c3", "#ffa347", "#44a0ff", "#3ed17a"].join(", ")}
				</div>
			</div>
			<div
				className={`grid space-y-2 space-x-2 max-w-full max-h-full grid-cols-${pattern.cols}`}
			>
				{Array.from({ length: pattern.rows * pattern.cols }, (_, idx) => {
					const cell = pattern.cells.find(
						(c: EnergizerCell) => c.index === idx,
					);
					return (
						<div
							key={idx}
							className="aspect-square rounded-lg border w-8/10 h-8/10 m-auto border-white/10"
							style={{
								backgroundColor: visible
									? (cell?.color ?? "rgba(255,255,255,0.08)")
									: "rgba(255,255,255,0.05)",
								opacity: visible ? 1 : 0.3,
							}}
						/>
					);
				})}
			</div>
			{waiting && (
				<div className="text-slate-200">
					Players are entering the pattern...
				</div>
			)}
		</div>
	);
}
