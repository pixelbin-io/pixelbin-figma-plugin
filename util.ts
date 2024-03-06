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

	static formatBytes(bytes, decimals = 2) {
		if (isNaN(bytes)) {
			return NaN;
		}
		if (bytes === 0) return "0 Bytes";

		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	}
}
