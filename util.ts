export class Util {
	// Function to add two numbers
	static camelCase(str: string) {
		return str
			.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
				return index == 0 ? word.toLowerCase() : word.toUpperCase();
			})
			.replace(/\s+/g, "");
	}

	static stringifyBBox = (bbox) => {
		// top_left_height_width
		return `${bbox.top}_${bbox.left}_${bbox.height}_${bbox.width}`;
	};

	static stringifyBBoxList = (bboxList) => {
		// [[0_0_10_10]_[100_100_1000_1000]_...]
		return `[${bboxList
			.map((bbox) => `[${this.stringifyBBox(bbox)}]`)
			.join("_")}]`;
	};

	static abbreviateNumber(number = 0) {
		number = Math.round(number);

		const SI_SYMBOL = ["", "K", "M", "G", "T", "P", "E"];

		// what tier? (determines SI symbol)
		const tier = Math.floor(Math.log10(Math.abs(number)) / 3);

		// if zero, we don't need a suffix
		if (tier == 0) return number;

		// get suffix and determine scale
		const suffix = SI_SYMBOL[tier];
		const scale = Math.pow(10, tier * 3);

		// scale the number
		const scaled = number / scale;

		// format number and add suffix
		return parseFloat(scaled.toFixed(1)) + suffix;
	}
}
