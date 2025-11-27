import { useEffect, useState } from "react";
import { useARStore } from "../lib/stores/useARStore";
import { useARSync } from "../lib/hooks/useARSync";

export default function ARScreen() {
	const {
		phase,
		bossHealth,
		bossMaxHealth,
		totalTaps,
		tapsNeeded,
		participatingPlayers,
		lastCollectedItemId,
	} = useARStore();
	const [showNotification, setShowNotification] = useState(false);

	useARSync();

	// Show notification when item collected
	useEffect(() => {
		if (lastCollectedItemId) {
			setShowNotification(true);
			setTimeout(() => setShowNotification(false), 2000);
		}
	}, [lastCollectedItemId]);

	return (
		<div className="w-screen h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white p-12">
			{phase === "anchoring" && <AnchoringPhase />}
			{phase === "hunting" && (
				<HuntingPhase
					totalTaps={totalTaps}
					tapsNeeded={tapsNeeded}
					showNotification={showNotification}
				/>
			)}
			{phase === "boss" && (
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
			<p className="text-3xl mb-12">Scan this marker with your phone</p>

			{/* Display ARUCO/Hiro marker */}
			<div className="bg-white p-8 rounded-2xl shadow-2xl">
				<img
					src="/markers/aruco-15.svg"
					alt="AR Marker - ArUco ID 15"
					className="w-96 h-96"
				/>
			</div>

			<p className="text-2xl mt-8 opacity-70">Activity starts in 30 seconds...</p>
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
				<div className="absolute top-24 left-1/2 -translate-x-1/2 bg-green-500 text-white px-8 py-4 rounded-xl text-3xl font-bold animate-bounce">
					✅ Item Found!
				</div>
			)}

			{/* Dressing Room Placeholder */}
			<div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-8 flex items-center justify-center">
				<div className="text-center">
					<p className="text-6xl mb-4">🎸</p>
					<p className="text-3xl opacity-70">Dressing Room</p>
					<p className="text-xl opacity-50 mt-2">
						(Missing items shown as outlines)
					</p>
				</div>
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
		<div className="flex flex-col items-center justify-center h-full">
			<h1 className="text-6xl font-bold mb-8 text-red-400 animate-pulse">
				BOSS ITEM APPEARED!
			</h1>

			<p className="text-3xl mb-8">Everyone tap together to collect it!</p>

			{/* Boss Health Bar */}
			<div className="w-3/4">
				<div className="flex justify-between text-2xl mb-2">
					<span>Health</span>
					<span>
						{bossHealth} / {bossMaxHealth}
					</span>
				</div>
				<div className="w-full bg-gray-700 h-16 rounded-full overflow-hidden border-4 border-red-500">
					<div
						className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-300"
						style={{
							width: `${bossMaxHealth > 0 ? (bossHealth / bossMaxHealth) * 100 : 0}%`,
						}}
					/>
				</div>
			</div>

			{/* Boss Icon */}
			<div className="text-9xl mt-12 animate-bounce">🎸</div>
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

			<div className="text-9xl mb-8">✅</div>

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
