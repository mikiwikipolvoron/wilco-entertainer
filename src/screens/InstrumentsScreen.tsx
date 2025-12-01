import type {
	InstrumentId,
	InstrumentInfo,
	InstrumentsPhase,
	ServerEvent,
} from "@mikiwikipolvoron/wilco-lib/events";
import { useEffect, useMemo, useState } from "react";
import { useSocketStore } from "../lib/stores/useSocketStore";

const FALLBACK_INSTRUMENTS: Record<InstrumentId, InstrumentInfo> = {
	drums: {
		id: "drums",
		name: "Drums",
		hint: "Big arm hits",
		tool: "Drumsticks",
		color: "#ef4444",
	},
	maracas: {
		id: "maracas",
		name: "Maracas",
		hint: "Shake",
		tool: "Maracas",
		color: "#f59e0b",
	},
	guitar: {
		id: "guitar",
		name: "Guitar",
		hint: "Strum action",
		tool: "Guitar pick",
		color: "#22d3ee",
	},
	violin: {
		id: "violin",
		name: "Violin",
		hint: "Bow motion",
		tool: "Violin bow",
		color: "#a855f7",
	},
};

export default function InstrumentsScreen() {
	const { connect, socket } = useSocketStore();
	const [phase, setPhase] = useState<InstrumentsPhase>("demo");
	const [demoInstrument, setDemoInstrument] = useState<InstrumentInfo | null>(null);
	const [energy, setEnergy] = useState(0);
	const [spotlight, setSpotlight] = useState<InstrumentId | null>(null);

	useEffect(() => {
		connect();
	}, [connect]);

	useEffect(() => {
		if (!socket) return;
		const handleEvent = (event: ServerEvent) => {
			switch (event.type) {
				case "instruments_phase":
					setPhase(event.phase);
					break;
				case "instruments_demo_step":
					setDemoInstrument(event.instrument);
					break;
				case "instruments_energy":
					setEnergy(Math.min(1, event.level));
					break;
				case "instruments_spotlight":
					setSpotlight(event.active ? event.instrument : null);
					break;
				default:
					break;
			}
		};
		socket.on("server_event", handleEvent);
		return () => socket.off("server_event", handleEvent);
	}, [socket]);

	const instrumentsList = useMemo(
		() => Object.values(FALLBACK_INSTRUMENTS),
		[],
	);

	return (
		<div className="w-full h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 overflow-hidden">
			{phase === "demo" && (
				<DemoView instrument={demoInstrument ?? FALLBACK_INSTRUMENTS.drums} />
			)}
			{phase === "finale" && (
				<FinaleView
					instruments={instrumentsList}
					energy={energy}
					spotlight={spotlight}
				/>
			)}
		</div>
	);
}

function DemoView({ instrument }: { instrument: InstrumentInfo }) {
	return (
		<div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col items-center justify-center text-center gap-4">
			<div className="text-sm uppercase tracking-wide text-slate-200">Demo loop</div>
			<div className="text-5xl font-extrabold">{instrument.name}</div>
			<div className="text-xl text-slate-200">{instrument.hint}</div>
			<div
				className="mt-6 w-48 h-48 rounded-3xl grid place-items-center text-2xl font-bold text-black"
				style={{ background: instrument.color }}
			>
				{instrument.tool}
			</div>
			<div className="text-slate-300 mt-4">
				Play the clip for {instrument.name} and show the move.
			</div>
		</div>
	);
}

function FinaleView({
	instruments,
	energy,
	spotlight,
}: {
	instruments: InstrumentInfo[];
	energy: number;
	spotlight: InstrumentId | null;
}) {
	return (
		<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 grid-rows-2 gap-3 sm:gap-4 overflow-hidden">
			<div className="sm:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 flex flex-col items-center justify-center">
				<div className="text-4xl font-extrabold mb-2">Collective Band</div>
				<div className="text-slate-200 mb-4">Everyone play your part!</div>
				<div className="w-48 h-48 rounded-full bg-white/10 border border-white/30 relative overflow-hidden">
					<div
						className="absolute inset-0 rounded-full"
						style={{
							background: "radial-gradient(circle, rgba(34,197,94,0.6), transparent 60%)",
							transform: `scale(${0.8 + energy * 0.4})`,
							transition: "transform 200ms ease-out",
						}}
					/>
					<div className="absolute inset-0 grid place-items-center text-xl font-bold">
						Energy
					</div>
				</div>
			</div>
			{instruments.map((inst) => (
				<div
					key={inst.id}
					className={`rounded-3xl border ${
						spotlight === inst.id ? "border-yellow-400 bg-yellow-200 text-black" : "border-white/10 bg-white/5"
					} p-4 flex flex-col items-center justify-center text-center gap-2`}
				>
					<div className="text-2xl font-extrabold">{inst.name}</div>
					<div className="text-sm opacity-80">{inst.hint}</div>
					<div
						className="mt-2 w-24 h-24 rounded-2xl grid place-items-center text-lg font-bold text-black"
						style={{ background: inst.color }}
					>
						{inst.tool}
					</div>
					{spotlight === inst.id && (
						<div className="text-base font-bold mt-2">SPOTLIGHT!</div>
					)}
				</div>
			))}
		</div>
	);
}
