import React, { useEffect, useState } from "react";
import "./style.scss";
import axios from "axios";

interface CanvasProps {
	url: string;
	isRefereshEnabled: any;
	onRefreshClick: () => void;
	selectedTabId: number;
	transFormedUrl: string;
}

function ImageCanvas({
	url,
	isRefereshEnabled,
	onRefreshClick,
	selectedTabId,
	transFormedUrl,
}: CanvasProps) {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [context, setContext] = useState("");

	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	useEffect(() => {
		if (selectedTabId === 3) {
			fetchContext();
		}
	}, [selectedTabId]);

	async function fetchContext() {
		var regex = /^(https?:\/\/[^\/]+)/;
		var modifiedString = transFormedUrl.replace(regex, "$1/context?url=/");
		let data = await axios.get(modifiedString);
		setContext(JSON.stringify(data.data.context));
		console.log("FETCHED CONTEXT", data);
	}

	return (
		<div className="canvas">
			{url.length ? (
				selectedTabId !== 3 ? (
					<img
						src={selectedTabId == 1 ? url : transFormedUrl}
						className={`transformed-image ${
							imageLoaded ? "visible" : "hidden"
						}`}
						onLoad={handleImageLoad}
					/>
				) : (
					<div className="context-box">{context}</div>
				)
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
