export type FloatingEmoji = {
	id: number;
	emoji: string;
	x: number;
	y: number;
	drift: number;
	scale?: number;
	duration?: number;
	jitter?: number;
};
