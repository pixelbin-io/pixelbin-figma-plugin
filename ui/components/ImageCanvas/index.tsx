import React, { useEffect, useState } from "react";
import "./style.scss";

interface CanvasProps {
	url: string;
	isRefereshEnabled: any;
	onRefreshClick: () => void;
}

function ImageCanvas({ url, isRefereshEnabled, onRefreshClick }: CanvasProps) {
	const [imageLoaded, setImageLoaded] = useState(false);

	useEffect(() => {
		console.log("Inside IC", url);
		setImageLoaded(false); // Reset the imageLoaded state when the url changes
	}, [url]);

	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	return (
		<div className="canvas">
			{url.length ? (
				<img
					src={url}
					className={`transformed-image ${imageLoaded ? "visible" : "hidden"}`}
					onLoad={handleImageLoad}
				/>
			) : (
				<div className="note-text">Please Select an image.</div>
			)}
			{isRefereshEnabled && (
				<div className="refresh-container">
					<button
						onClick={onRefreshClick}
						className="button button--primary refresh-btn"
					>
						Refresh
					</button>
				</div>
			)}
		</div>
	);
}

export default ImageCanvas;
