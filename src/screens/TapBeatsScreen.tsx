import type { BeatsPhase } from "@mikiwikipolvoron/wilco-lib/data";
import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { useBeatsSync } from "../lib/hooks/useBeatsSync";
import { useBeatsStore } from "../lib/stores/useBeatsStore";
import { useServerSync } from "../lib/hooks/useServerSync";

// Team color mapping
const TEAM_COLORS = {
	A: "#ec4899", // pink
	B: "#3b82f6", // blue
	C: "#f97316", // orange
	D: "#22c55e", // green
};

export default function TapBeatsScreen() {
	const { phase, round, bpm, winner, groupAccuracies, mvp } = useBeatsStore();
	const beatAnimationRef = useRef<number>(0);
	const beatAudioRef = useRef<Howl | null>(null);
	const melodyAudioRef = useRef<Howl | null>(null);
	const animationFrameRef = useRef<number | null>(null);
	const lastBeatTimeRef = useRef<number>(0);
	const [audioPermissionGranted, setAudioPermissionGranted] = useState(false);
	useBeatsSync();
	useServerSync();

	// Audio setup - create Howl instances on mount
	useEffect(() => {
		console.log("[TapBeatsScreen] Initializing audio");

		beatAudioRef.current = new Howl({
			src: ["/audio/BeatsLushLife.mp3"],
			loop: true,
			volume: 1.0,
			onload: () => console.log("[Audio] Beat track loaded"),
			onloaderror: (id, error) =>
				console.error("[Audio] Beat track failed to load:", error),
		});

		melodyAudioRef.current = new Howl({
			src: ["/audio/MelodyLushLife.mp3"],
			loop: true,
			volume: 1.0,
			onload: () => console.log("[Audio] Melody track loaded"),
			onloaderror: (id, error) =>
				console.error("[Audio] Melody track failed to load:", error),
		});

		return () => {
			console.log("[TapBeatsScreen] Cleaning up audio");
			if (beatAudioRef.current) {
				beatAudioRef.current.unload();
			}
			if (melodyAudioRef.current) {
				melodyAudioRef.current.unload();
			}
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, []);

	const handleEnableAudio = () => {
		console.log("[TapBeatsScreen] Audio permission granted");
		setAudioPermissionGranted(true);
	};

	// Handle phase-specific audio and animations
	useEffect(() => {
		const beatAudio = beatAudioRef.current;
		const melodyAudio = melodyAudioRef.current;

		if (!beatAudio || !melodyAudio || !audioPermissionGranted) return;

		console.log(
			`[TapBeatsScreen] Phase changed: ${phase}, Round: ${round}, BPM: ${bpm}`,
		);

		if (phase === "instructions") {
			// Stop all audio and reset
			beatAudio.stop();
			melodyAudio.stop();
			stopBeatAnimation();
		} else if (phase === "beat_on") {
			// Calculate playback rate based on BPM (source is 96 BPM)
			const playbackRate = bpm / 96;
			console.log(
				`[Audio] Setting playback rate to ${playbackRate.toFixed(3)}x (${bpm} BPM)`,
			);

			beatAudio.rate(playbackRate);
			melodyAudio.rate(playbackRate);

			// Fade beat volume in
			const currentBeatVolume = beatAudio.volume();
			beatAudio.fade(currentBeatVolume, 1.0, 500);
			melodyAudio.volume(1.0);

			// Play both tracks (or resume if already playing)
			if (!beatAudio.playing()) {
				beatAudio.play();
			}
			if (!melodyAudio.playing()) {
				melodyAudio.play();
			}

			// Sync positions if they've drifted
			const beatPos = beatAudio.seek() as number;
			const melodyPos = melodyAudio.seek() as number;
			if (Math.abs(beatPos - melodyPos) > 0.1) {
				console.log("[Audio] Syncing track positions");
				melodyAudio.seek(beatPos);
			}

			// Start beat-synced animation
			startBeatAnimation(bpm);
		} else if (phase === "beat_off") {
			// Fade out beat, keep melody
			console.log("[Audio] Fading out beat track");
			beatAudio.fade(beatAudio.volume(), 0.0, 500);
			melodyAudio.volume(1.0);

			// Keep beat animation running for team circle pulses
			startBeatAnimation(bpm);
		} else if (phase === "results") {
			// Fade out both tracks
			console.log("[Audio] Fading out all tracks for results");
			beatAudio.fade(beatAudio.volume(), 0.0, 1000);
			melodyAudio.fade(melodyAudio.volume(), 0.0, 1000);

			// Stop after fade completes
			setTimeout(() => {
				beatAudio.stop();
				melodyAudio.stop();
			}, 1000);

			stopBeatAnimation();
		}
	}, [phase, round, bpm, audioPermissionGranted]);

	const startBeatAnimation = (currentBpm: number) => {
		// Stop any existing animation
		stopBeatAnimation();

		const beatIntervalMs = (60 / currentBpm) * 1000; // Convert BPM to milliseconds
		lastBeatTimeRef.current = performance.now();

		console.log(
			`[Animation] Starting beat animation at ${currentBpm} BPM (${beatIntervalMs.toFixed(0)}ms interval)`,
		);

		const animationLoop = (timestamp: number) => {
			const elapsed = timestamp - lastBeatTimeRef.current;

			if (elapsed >= beatIntervalMs) {
				// Trigger beat pulse
				triggerBeatPulse();
				lastBeatTimeRef.current = timestamp;
			}

			animationFrameRef.current = requestAnimationFrame(animationLoop);
		};

		animationFrameRef.current = requestAnimationFrame(animationLoop);
	};

	const stopBeatAnimation = () => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
	};

	const triggerBeatPulse = () => {
		// Enhanced white overlay
		const beatElement = document.getElementById("beat-pulse");
		if (beatElement) {
			beatElement.style.animation = "none";
			void beatElement.offsetWidth;
			beatElement.style.animation = "beatPulse 0.2s ease-out";
		}

		// Trigger animated outer ring and inner circle (only during beat_on)
		if (phase === "beat_on") {
			const beatInterval = (60 / bpm) * 1000;

			// Animate outer ring
			const animatedRing = document.getElementById("beat-ring-animated");
			if (animatedRing) {
				animatedRing.style.animation = "none";
				void animatedRing.offsetWidth;
				animatedRing.style.animation = `centralBeatRing ${beatInterval}ms linear`;
			}

			// Animate inner circle
			const innerCircle = document.getElementById("inner-beat-circle");
			if (innerCircle) {
				innerCircle.style.animation = "none";
				void innerCircle.offsetWidth;
				innerCircle.style.animation = `innerCirclePulse ${Math.min(beatInterval, 300)}ms ease-out`;
			}
		}

		// Trigger team ripples on beat during beat_off
		if (phase === "beat_off") {
			["A", "B", "C", "D"].forEach((groupId) => {
				const rippleElement = document.getElementById(`team-ripple-${groupId}`);
				if (rippleElement) {
					rippleElement.style.animation = "none";
					void rippleElement.offsetWidth;
					rippleElement.style.animation = "teamRipple 400ms ease-out";
				}
			});
		}
	};


	// Clean up on unmount
	useEffect(() => {
		return () => stopBeatAnimation();
	}, []);

	// beat_on or beat_off phases
	return (
		<>
			{phase === ("beat_on" as BeatsPhase) && <BeatsActivityPhase />}
			{phase === ("beat_off" as BeatsPhase) && <BeatsActivityPhase />}
			{phase === ("instructions" as BeatsPhase) && (
				<InstructionsPhase
					audioPermissionGranted={audioPermissionGranted}
					onEnableAudio={handleEnableAudio}
				/>
			)}
			{phase === ("results" as BeatsPhase) && (
				<ResultsPhase
					winner={winner}
					groupAccuracies={groupAccuracies}
					mvp={mvp}
				/>
			)}
		</>
	);
}

function BeatsActivityPhase() {
	const { phase, round, bpm, groupAccuracies, winner, mvp } = useBeatsStore();

	// Calculate winning team(s) during beat_off phase
	const getWinningTeams = () => {
		if (phase !== "beat_off" || groupAccuracies.length === 0) return [];

		const maxAccuracy = Math.max(...groupAccuracies.map(g => g.accuracy));
		return groupAccuracies.filter(g => g.accuracy === maxAccuracy).map(g => g.groupId);
	};

	const winningTeams = getWinningTeams();

	// Helper to lighten a color
	const lightenColor = (hex: string, percent: number) => {
		// Special case for orange - use custom shade
		if (hex === "#f97316") {
			return "#f5975d";
		}

		const num = parseInt(hex.replace("#", ""), 16);
		const r = (num >> 16) + Math.round(255 * percent);
		const g = ((num >> 8) & 0x00FF) + Math.round(255 * percent);
		const b = (num & 0x0000FF) + Math.round(255 * percent);

		return `#${Math.min(255, r).toString(16).padStart(2, '0')}${Math.min(255, g).toString(16).padStart(2, '0')}${Math.min(255, b).toString(16).padStart(2, '0')}`;
	};

	// Determine background style based on winning teams
	const getBackgroundStyle = () => {
		if (phase !== "beat_off" || winningTeams.length === 0) {
			return { background: "linear-gradient(to bottom right, #581c87, #000000, #1e3a8a)" };
		}

		if (winningTeams.length === 1) {
			// Single winner - lighter version of team color
			const winnerColor = TEAM_COLORS[winningTeams[0] as keyof typeof TEAM_COLORS];
			const lightColor = lightenColor(winnerColor, 0.6);
			return { backgroundColor: lightColor };
		} else {
			// Tie - create gradient with lighter tied team colors
			const colors = winningTeams.map(id => lightenColor(TEAM_COLORS[id as keyof typeof TEAM_COLORS], 0.6));
			return { background: `linear-gradient(to bottom right, ${colors.join(", ")})` };
		}
	};

	return (
		<div
			className="w-screen h-screen flex items-center justify-center relative overflow-hidden transition-all duration-500"
			style={getBackgroundStyle()}
		>
			{/* Beat pulse indicator */}
			{phase === "beat_on" && (
				<div
					id="beat-pulse"
					className="absolute inset-0 bg-white opacity-0"
					style={{ mixBlendMode: "overlay" }}
				/>
			)}

			{/* Central beat target - only during beat_on */}
			{phase === "beat_on" && (
				<div
					id="central-beat-ring"
					className="absolute inset-0 flex items-center justify-center pointer-events-none"
					style={{ zIndex: 10 }}
				>
					{/* Inner target circle - pulses on beat */}
					<div
						id="inner-beat-circle"
						className="rounded-full bg-white absolute"
						style={{
							width: "500px",
							height: "500px",
							opacity: 0.8,
						}}
					/>

					{/* Outer ring - animated */}
					<div
						id="beat-ring-animated"
						className="rounded-full border-8 border-white absolute"
						style={{
							width: "500px",
							height: "500px",
							opacity: 0,
							transform: "scale(1.0)",
							willChange: "transform, opacity",
						}}
					/>
				</div>
			)}

			{/* Round indicator */}
			<div
				className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-3xl font-bold"
				style={{ zIndex: 20 }}
			>
				Round {round}/3
				{phase === "beat_on" && round > 1 && (
					<span className="ml-4 text-red-400 animate-pulse">FASTER!</span>
				)}
			</div>

			{/* Team sync visualizations - only show during beat_off */}
			{phase === "beat_off" && (
				<div className="grid grid-cols-2 grid-rows-2 w-full h-full absolute inset-0">
					{["A", "B", "C", "D"].map((groupId) => {
						const groupData = groupAccuracies.find(
							(g) => g.groupId === groupId,
						);
						const accuracy = groupData?.accuracy || 0;
						const isWinning = winningTeams.includes(groupId);
						const circleSize = 450;

						return (
							<div
								key={groupId}
								className="flex items-center justify-center"
							>
								<div className="relative flex items-center justify-center">
									{/* Inner filled circle - fixed size with percentage inside */}
									<div
										className="rounded-full transition-all duration-500 flex items-center justify-center"
										style={{
											width: `${circleSize}px`,
											height: `${circleSize}px`,
											backgroundColor:
												TEAM_COLORS[groupId as keyof typeof TEAM_COLORS],
											opacity: 0.8,
											boxShadow: isWinning
												? `0 0 80px 20px ${TEAM_COLORS[groupId as keyof typeof TEAM_COLORS]}`
												: `0 0 20px ${TEAM_COLORS[groupId as keyof typeof TEAM_COLORS]}`,
										}}
									>
										<div className="text-white text-8xl font-bold">
											{Math.round(accuracy * 100)}%
										</div>
									</div>

									{/* Beat-synced ring that pulses to the beat */}
									<div
										id={`team-ripple-${groupId}`}
										className="absolute rounded-full pointer-events-none"
										style={{
											width: `${circleSize}px`,
											height: `${circleSize}px`,
											border: `8px solid ${TEAM_COLORS[groupId as keyof typeof TEAM_COLORS]}`,
											opacity: 0,
											transform: "scale(1.0)",
											willChange: "transform, opacity",
										}}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}

			<style>{`
				@keyframes beatPulse {
					0% { opacity: 0; filter: blur(0px); }
					50% { opacity: 0.4; filter: blur(2px); }
					100% { opacity: 0; filter: blur(0px); }
				}

				@keyframes centralBeatRing {
					0% {
						transform: scale(1.0);
						opacity: 0.8;
					}
					20% {
						transform: scale(1.0);
						opacity: 0.6;
					}
					100% {
						transform: scale(1.5);
						opacity: 0;
					}
				}

				@keyframes innerCirclePulse {
					0% {
						opacity: 0.8;
						transform: scale(1.0);
					}
					50% {
						opacity: 0.5;
						transform: scale(0.95);
					}
					100% {
						opacity: 0.8;
						transform: scale(1.0);
					}
				}

				@keyframes teamRipple {
					0% {
						transform: scale(1.0);
						opacity: 0.8;
					}
					50% {
						transform: scale(1.3);
						opacity: 0.5;
					}
					100% {
						transform: scale(1.6);
						opacity: 0;
					}
				}
			`}</style>
		</div>
	);
}

function InstructionsPhase({
	audioPermissionGranted,
	onEnableAudio,
}: {
	audioPermissionGranted: boolean;
	onEnableAudio: () => void;
}) {
	return (
		<div className="w-screen h-screen bg-linear-to-br from-indigo-900 via-purple-900 to-pink-900 flex flex-col items-center justify-center text-white p-12 relative">
			{/* Audio permission button - always show if not granted */}
			{!audioPermissionGranted && (
				<div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
					<button
						onClick={onEnableAudio}
						className="bg-green-500 hover:bg-green-600 text-white text-4xl font-bold py-6 px-12 rounded-2xl shadow-2xl transition-all transform hover:scale-105 animate-pulse"
					>
						🔊 Enable Audio
					</button>
				</div>
			)}

			{/* Part 1: Team Assignment (0-15s) */}
			<div className="instruction-part-1 absolute inset-0 flex flex-col items-center justify-center p-12">
				<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-5xl">
					<p className="text-5xl font-bold mb-8 text-center">
						You have been assigned to
						<br />
						Team Pink, Blue, Orange, or Green
					</p>
					<p className="text-3xl text-center mt-8 leading-relaxed">
						Raise your screen to your forehead
						<br />
						and look around to find your teammates!
					</p>
				</div>
			</div>

			{/* Part 2: Title (15-18s) */}
			<div className="instruction-part-2 absolute inset-0 flex items-center justify-center">
				<h1 className="text-9xl font-bold text-center leading-tight">
					Team Synchronization
					<br />
					Challenge
				</h1>
			</div>

			{/* Part 3: Explanation (18-28s) */}
			<div className="instruction-part-3 absolute inset-0 flex flex-col items-center justify-center p-12">
				<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 max-w-5xl">
					<p className="text-5xl font-bold text-red-400 mb-8 text-center">
						!The stage is out of sync!
					</p>
					<p className="text-3xl text-center leading-relaxed">
						As teams, you need to tap to the beat
						<br />
						to resynchronize it.
					</p>
					<p className="text-2xl text-center mt-8 opacity-80">
						The better your team's timing,
						<br />
						the stronger your presence on stage!
					</p>
				</div>
			</div>

			{/* Part 4: Get Ready (28-38s) */}
			<div className="instruction-part-4 absolute inset-0 flex items-center justify-center">
				<p className="text-8xl font-bold animate-pulse">Get ready to tap...</p>
			</div>

			<style>{`
				/* Part 1: Visible 0-15s (0%-39.5% of 38s) */
				.instruction-part-1 {
					animation: showPart1 38s forwards;
					opacity: 0;
					pointer-events: none;
				}

				/* Part 2: Visible 15-18s (39.5%-47.4% of 38s) */
				.instruction-part-2 {
					animation: showPart2 38s forwards;
					opacity: 0;
					pointer-events: none;
				}

				/* Part 3: Visible 18-28s (47.4%-73.7% of 38s) */
				.instruction-part-3 {
					animation: showPart3 38s forwards;
					opacity: 0;
					pointer-events: none;
				}

				/* Part 4: Visible 28-38s (73.7%-100% of 38s) */
				.instruction-part-4 {
					animation: showPart4 38s forwards;
					opacity: 0;
					pointer-events: none;
				}

				@keyframes showPart1 {
					0% { opacity: 1; }
					36.8% { opacity: 1; }
					39.5% { opacity: 0; }
					100% { opacity: 0; }
				}

				@keyframes showPart2 {
					0% { opacity: 0; }
					39.5% { opacity: 0; }
					42% { opacity: 1; }
					44.7% { opacity: 1; }
					47.4% { opacity: 0; }
					100% { opacity: 0; }
				}

				@keyframes showPart3 {
					0% { opacity: 0; }
					47.4% { opacity: 0; }
					50% { opacity: 1; }
					71% { opacity: 1; }
					73.7% { opacity: 0; }
					100% { opacity: 0; }
				}

				@keyframes showPart4 {
					0% { opacity: 0; }
					73.7% { opacity: 0; }
					76% { opacity: 1; }
					100% { opacity: 1; }
				}
			`}</style>
		</div>
	);
}

function ResultsPhase({
	winner,
	groupAccuracies,
	mvp,
}: {
	winner: string | null;
	groupAccuracies: any[];
	mvp: { playerId: string; nickname: string; accuracy: number } | null;
}) {
	const winnerColor = winner
		? TEAM_COLORS[winner as keyof typeof TEAM_COLORS]
		: "#ffffff";

	return (
		<div
			className="w-screen h-screen flex flex-col items-center justify-center text-white transition-all duration-1000"
			style={{
				backgroundColor: winnerColor,
			}}
		>
			<div className="text-center space-y-12">
				<div className="text-9xl font-bold mb-8">100% SYNCH</div>
				<div className="text-7xl font-bold mb-4">ACCURACY ACHIEVED!</div>
				<div className="text-6xl mt-12">
					<span className="text-yellow-300">🏆</span> Team {winner} Wins!{" "}
					<span className="text-yellow-300">🏆</span>
				</div>

				{mvp && (
					<div className="mt-16 bg-black/30 backdrop-blur-sm rounded-2xl p-12">
						<div className="text-4xl mb-4">MVP</div>
						<div className="text-6xl font-bold">{mvp.nickname}</div>
						<div className="text-3xl mt-4">
							{Math.round(mvp.accuracy * 100)}% accuracy
						</div>
					</div>
				)}

				<div className="mt-12 grid grid-cols-4 gap-8 max-w-4xl">
					{groupAccuracies.map((group) => (
						<div
							key={group.groupId}
							className="bg-black/30 backdrop-blur-sm rounded-xl p-6"
						>
							<div className="text-3xl font-bold mb-2">
								Team {group.groupId}
							</div>
							<div className="text-2xl">
								{Math.round(group.accuracy * 100)}%
							</div>
							<div className="text-sm mt-2">{group.tapCount} taps</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
