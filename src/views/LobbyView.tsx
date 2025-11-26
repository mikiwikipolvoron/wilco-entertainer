import { QRCodeSVG } from "qrcode.react";
import { useLobbySync } from "../lib/hooks/useLobbySync";
import { useLobbyStore } from "../lib/stores/useLobbyStore";
import { useServerStore } from "../lib/stores/useServerStore";

export default function LobbyView() {
	const state = useServerStore();
	const { secondsRemaining, emojis } = useLobbyStore();
	const clientUrl = "http://192.168.0.7:5173";

	useLobbySync();

	return (
		<div
			style={{
				width: "100%",
				height: "100vh",
				background: "#FFD6E8", // pastel pink
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				textAlign: "center",
				padding: "2rem",
				fontFamily: "system-ui",
				position: "relative",
				overflow: "hidden",
			}}
		>
			{/* Lobby core UI */}
			<h1>Join to set the stage!</h1>
			<p>
				First task revealed in <strong>{secondsRemaining}</strong>
			</p>
			<div className="m-6">
				<QRCodeSVG value={clientUrl} />
			</div>
			<p style={{ fontSize: "1rem" }}>
				Scan this QR code on your phone to join:
				<br />
				<code>{clientUrl}</code>
			</p>

			{/* Emoji animation keyframes */}
			<style>
				{`
                @keyframes floatUpDynamic {
                  0% {
                    transform: translate(var(--start-x), var(--start-y)) scale(var(--scale));
                    opacity: 1;
                  }
                  100% {
                    transform: translate(var(--start-x), calc(var(--start-y) - 1300px))
                              translateX(calc(var(--jitter) * 1px))
                              scale(var(--scale));
                    opacity: 0;
                  }
                }
              `}
			</style>

			{/* Floating emojis overlay, only active in lobby */}
			<div
				style={{
					position: "absolute",
					top: 0,
					left: 0,
					width: "100%",
					height: "100%",
					pointerEvents: "none",
					overflow: "hidden",
				}}
			>
				{emojis.map((item) => (
					<div
						key={item.id}
                        className="text-5xl top-0 left-0 absolute pointer-events-none"
						style={{
							transform: `translate(var(--start-x), var(--start-y))`,
							animation: `floatUpDynamic ${item.duration}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
							["--start-x" as string]: `${item.x}px`,
							["--start-y" as string]: `${item.y}px`,
							["--scale" as string]: item.scale,
							["--jitter" as string]: item.jitter,
						}}
					>
						{item.emoji}
					</div>
				))}
			</div>
		</div>
	);
}
