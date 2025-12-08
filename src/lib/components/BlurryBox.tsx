interface Props {
	title?: string;
	text?: string | string[];
	children?: React.ReactNode;
	className?: string;
	padding?: number;
	rounded?: boolean;
}

export default function BlurryBox({
	title,
	text,
	children,
	className,
	padding = 4,
	rounded = true,
}: Props) {
	const classNames = `bg-white/10 backdrop-blur-sm min-w-3xl rounded-${rounded ? "2xl" : "none"} p-${padding} max-w-4xl ${className ?? ""}`;
	return (
		<div className="flex flex-col items-center text-center justify-center text-wrap space-y-5">
			<h2 className="text-7xl font-bold text-center">{title}</h2>
			<div className={classNames}>
				{children && <>{children}</>}
				{text && Array.isArray(text) ? 
						text.map((t) => (
							<p
								key={`text-${t}`}
								className="text-5xl text-center leading-relaxed"
							>
								{t}
							</p>
						))
				: <div className="hidden"></div>}

				{text && !Array.isArray(text) && (
					<p className="text-5xl text-center leading-relaxed">{text}</p>
				)}
			</div>
		</div>
	);
}
