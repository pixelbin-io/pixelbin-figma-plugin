export const identifierSequence = ["wm", "erase", "sr"];
export const basic_identifier = "Basic";

export const allowedPlugins = {
	wm: { operations: ["Watermark Remover"] },
	erase: { operations: ["Erase BG"] },
	sr: { operations: ["Upscale"] },
	// bg: { identifier: "bg", operations: ["AI BG Extender"] },
	generate: {
		operations: ["AI Background Generator"],
	},
	shadow: { operations: ["AI Shadow Generator"] },
	af: { operations: ["Artifact Removal"] },
	ic: { operations: ["Intelligent Crop"] },
	//below property t is for basic operations
	t: {
		operations: [
			"Blur",
			"Change DPI",
			"Compress",
			"Extend",
			"Extract",
			"Flatten",
			"Flip",
			"Flop",
			"Greyscale",
			"Levels",
			"Median",
			"Merge",
			"Modulate",
			"Negative",
			"Normalize",
			"Resize",
			"Rotate",
			"Sharpen",
			"Tint",
			"Trim",
		],
	},
};
