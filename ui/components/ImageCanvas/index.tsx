import React from "react";
import "./style.scss";

interface canvasProps {
	url: string;
	isRefereshEnabled: boolean;
	onRefreshClick: () => void;
}

function ImageCanvas({ url, isRefereshEnabled, onRefreshClick }: canvasProps) {
	return (
		<div className="canvas">
			{url.length ? (
				<img src={url} className="transformed-image" />
			) : (
				<div className="note-text">Please Select an image.</div>
			)}
			{isRefereshEnabled ? (
				<div className="refresh-container">
					<button
						onClick={onRefreshClick}
						className="button button--primary refresh-btn"
					>
						Refresh
					</button>
				</div>
			) : null}
		</div>
	);
}

export default ImageCanvas;
