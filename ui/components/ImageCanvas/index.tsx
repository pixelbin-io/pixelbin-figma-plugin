import React, { useEffect, useState } from "react";
import "./style.scss";
import axios from "axios";

interface CanvasProps {
	url: string;
	selectedTabId: number;
	transFormedUrl: string;
	onDiscardClick: () => void;
}

function ImageCanvas({
	url,
	selectedTabId,
	transFormedUrl,
	onDiscardClick,
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

			{transFormedUrl && selectedTabId === 1 && isImageHovered ? (
				<div
					className="discard-modal"
					onMouseEnter={() => setIsImageHovered(true)}
					onMouseLeave={() => setIsImageHovered(false)}
				>
					<div
						className="button button--primary discard-btn"
						onClick={onDiscardClick}
					>
						Discard Changes
					</div>
				</div>
			) : null}
		</div>
	);
}

export default ImageCanvas;
