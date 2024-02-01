import React from "react";
import "./style.scss";

function ImageCanvas() {
	return (
		<div className="canvas">
			{false ? (
				<div className="note-text">Please Select an image.</div>
			) : (
				<img
					className="transformed-image"
					src={
						"https://cdn.pixelbin.io/v2/muddy-lab-41820d/original/__figma/ebg/watermark-the-milk-poster13f7141a1-6533-4bc0-a512-936cba1b0953.jpeg"
					}
				/>
			)}
		</div>
	);
}

export default ImageCanvas;
