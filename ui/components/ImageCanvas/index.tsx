import React from "react";
import "./style.scss";

interface canvasProps {
	url: string;
}

function ImageCanvas({ url }: canvasProps) {
	return (
		<div className="canvas">
			{url.length ? (
				<img src={url} className="transformed-image" />
			) : (
				<div className="note-text">Please Select an image.</div>
			)}
		</div>
	);
}

export default ImageCanvas;
