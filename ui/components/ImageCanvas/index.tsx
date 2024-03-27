import React, { useEffect, useState } from "react";
import "./style.scss";
import axios from "axios";

interface CanvasProps {
	url: string;
	selectedTabId: number;
	transFormedUrl: string;
	isTransformationApplied: boolean;
}

function ImageCanvas({
	url,
	selectedTabId,
	transFormedUrl,
	isTransformationApplied,
}: CanvasProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [isImageHovered, setIsImageHovered] = useState(false);

	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	return (
		<div className="canvas">
			{url.length ? (
				<img
					src={selectedTabId == 1 ? url : transFormedUrl}
					className={`transformed-image ${imageLoaded ? "visible" : "hidden"}`}
					onLoad={handleImageLoad}
					onMouseEnter={() => setIsImageHovered(true)}
					onMouseLeave={() => setIsImageHovered(false)}
				/>
			) : (
				<div className="note-text">Please Select an image.</div>
			)}
		</div>
	);
}

export default ImageCanvas;
