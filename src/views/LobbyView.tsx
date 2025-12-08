import { QRCodeSVG } from "qrcode.react";
import { useLobbySync } from "../lib/hooks/useLobbySync";
// import { useServerStore } from "../lib/stores/useServerStore";
import { useServerSync } from "../lib/hooks/useServerSync";
import { useLobbyStore } from "../lib/stores/useLobbyStore";

export default function LobbyView() {
	// const state = useServerStore();
	const { emojis } = useLobbyStore();
	const clientUrl = "https://mikiwikipolvoron.github.io/wilco-client";

	useLobbySync();
	useServerSync();

	return (
		<div className="w-full h-screen flex flex-col justify-evenly align-middle text-center p-0 items-center m-0 border-0 gradient-background text-blue-950">
			{/* Lobby core UI */}
			<h1 className="text-8xl">It's not too late to join!</h1>
			<p className="text-3xl">
				But better <strong>hurry</strong>, the activities resume soon!
			</p>
			<div className="p-2 rounded-xl mt-2 mb-2 bg-[#e2e2e2] shadow-md">
				<QRCodeSVG
					size="200"
					bgColor="#e2e2e2e2"
					fgColor="#162556"
					value={clientUrl}
				/>
			</div>
			<p></p>
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
