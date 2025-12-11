import { useEffect, useState } from "react";
import BlurryBox from "../lib/components/BlurryBox";
import { useARSync } from "../lib/hooks/useARSync";
import { useServerSync } from "../lib/hooks/useServerSync";
import { useARStore } from "../lib/stores/useARStore";

export default function ARScreen() {
	const {
		phase,
		bossHealth,
		bossMaxHealth,
		totalTaps,
		tapsNeeded,
		participatingPlayers,
		lastCollectedItemId,
		instructionText,
	} = useARStore();
	const [showNotification, setShowNotification] = useState(false);

	useARSync();
	useServerSync();

	// Show notification when item collected
	useEffect(() => {
		if (lastCollectedItemId) {
			setShowNotification(true);
			setTimeout(() => setShowNotification(false), 2000);
		}
	}, [lastCollectedItemId]);

	return (
		<div className="w-screen h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-12">
			{phase === "instructions" && <Instructions text={instructionText} />}
			{phase === "anchoring" && <AnchoringPhase />}
			{phase === "hunting" && (
				<HuntingPhase
					totalTaps={totalTaps}
					tapsNeeded={tapsNeeded}
					showNotification={showNotification}
				/>
			)}
			{phase === "boss" && bossHealth > 0 && (
				<BossPhase bossHealth={bossHealth} bossMaxHealth={bossMaxHealth} />
			)}
			{phase === "results" && (
				<ResultsPhase
					totalTaps={totalTaps}
					participatingPlayers={participatingPlayers}
				/>
			)}
		</div>
	);
}

function AnchoringPhase() {
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<h1 className="text-6xl font-bold mb-8">AR Dressing Room Challenge</h1>

			{/* Display calibration target */}
			<BlurryBox>
				<p className="text-3xl mb-12">Point your camera at the target</p>

				<img
					src="/target.png"
					alt="AR Calibration Target"
					className="w-96 h-96 object-contain"
				/>
				<p className="text-2xl mt-8 opacity-70">
					Activity starts in 30 seconds...
				</p>
			</BlurryBox>
		</div>
	);
}

function HuntingPhase({
	totalTaps,
	tapsNeeded,
	showNotification,
}: {
	totalTaps: number;
	tapsNeeded: number;
	showNotification: boolean;
}) {
	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-5xl font-bold mb-4">Find the Missing Items!</h1>
				<div className="text-4xl font-bold">
					Progress: {totalTaps} / {tapsNeeded} items found
				</div>
				<p className="text-2xl mt-2 opacity-70">
					Each player needs 10 taps minimum
				</p>
			</div>

			{/* Progress Bar */}
			<div className="w-full bg-gray-700 h-12 rounded-full overflow-hidden mb-8">
				<div
					className="bg-green-500 h-full transition-all duration-500"
					style={{
						width: `${tapsNeeded > 0 ? (totalTaps / tapsNeeded) * 100 : 0}%`,
					}}
				/>
			</div>

			{/* Notification */}
			{showNotification && (
				<div className="z-50 absolute transition-all top-1/2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-xl text-3xl font-bold animate-bounce">
					Item Found!
				</div>
			)}

			{/* Dressing Room Placeholder */}
			<div className="flex-col bg-white/10 backdrop-blur-sm rounded-2xl p-3 flex items-center justify-center">
				<img
					src="/flower.png"
					alt="Missing Item"
					className="max-w-lg object-contain"
					style={{
						filter: "grayscale(100%) brightness(0.6) opacity(0.5)",
						transition: "filter 0.8s ease-in-out",
					}}
				/>
			</div>
		</div>
	);
}

function BossPhase({
	bossHealth,
	bossMaxHealth,
}: {
	bossHealth: number;
	bossMaxHealth: number;
}) {
	return (
		<div className="flex flex-col items-center justify-center h-screen w-full">
			<h1 className="text-6xl font-bold mb-8 text-red-400 animate-pulse">
				BOSS ITEM APPEARED!
			</h1>

			<p className="text-3xl mb-8">Everyone tap together to collect it!</p>

			{/* Boss Health Bar */}
			<div className="w-3/4">
				<div className="flex justify-between text-2xl mb-2">
					<span>Health</span>
					<span>
						{bossHealth ?? 0} / {bossMaxHealth ?? 0}
					</span>
				</div>
				<div className="w-max-5xl bg-gray-700 h-16 rounded-full overflow-hidden border-4 border-red-500">
					<div
						className="bg-linear-to-r from-red-600 to-red-400 h-full transition-all duration-300"
						style={{
							width: `${bossMaxHealth > 0 ? (bossHealth / bossMaxHealth) * 100 : 0}%`,
						}}
					/>
				</div>
			</div>

			{/* Boss Icon */}
			<div className="mt-12 animate-bounce">
				<img
					src="/flower.png"
					alt="Boss Enemy"
					className="w-96 h-96 object-contain"
					style={{
						filter: `grayscale(${bossMaxHealth > 0 ? (bossHealth / bossMaxHealth) * 100 : 0}) brightness(${1 - (bossMaxHealth > 0 ? Math.max(bossHealth / bossMaxHealth, 0.3) : 1)}) opacity(${1 - (bossMaxHealth > 0 ? Math.max(bossHealth / bossMaxHealth, 0.5) : 1)})`,
						transition: "filter 0.8s ease-in-out",
					}}
				/>
			</div>
		</div>
	);
}

function ResultsPhase({
	totalTaps,
	participatingPlayers,
}: {
	totalTaps: number;
	participatingPlayers: number;
}) {
	return (
		<div className="flex flex-col items-center justify-center h-full">
			<h1 className="text-7xl font-bold mb-8 text-green-400">
				Item Collected!
			</h1>

			<div className="mb-8">
				<img
					src="/flower.png"
					alt="Collected Item"
					className="w-96 h-96 object-contain"
					style={{
						filter: "none",
						transition: "filter 0.8s ease-in-out",
					}}
				/>
			</div>

			<div className="text-center text-3xl space-y-4">
				<p>
					Total Taps: <span className="font-bold">{totalTaps}</span>
				</p>
				<p>
					Players: <span className="font-bold">{participatingPlayers}</span>
				</p>
			</div>

			<p className="text-2xl mt-12 opacity-70">Returning to lobby...</p>
		</div>
	);
}

function Instructions({ text }: { text: string }) {
	return (
		<div className="flex items-center justify-center h-full text-center">
			<BlurryBox text={text || "Awaiting instructions..."} />
		</div>
	);
}
