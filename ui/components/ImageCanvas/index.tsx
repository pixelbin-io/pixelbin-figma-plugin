import React, { useEffect, useState } from "react";
import "./style.scss";
import axios from "axios";
import {
	JsonView,
	allExpanded,
	darkStyles,
	defaultStyles,
	collapseAllNested,
} from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface CanvasProps {
	url: string;
	selectedTabId: number;
	transFormedUrl: string;
}

function ImageCanvas({ url, selectedTabId, transFormedUrl }: CanvasProps) {
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
		setContext(data.data.context);
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
					<JsonView
						data={context}
						shouldExpandNode={collapseAllNested}
						style={darkStyles}
					/>
				)
			) : (
				<div className="note-text">Please Select an image.</div>
			)}
		</div>
	);
}

export default ImageCanvas;
