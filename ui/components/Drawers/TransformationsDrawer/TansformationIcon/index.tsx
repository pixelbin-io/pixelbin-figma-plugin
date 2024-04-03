import React, { useEffect, useState } from "react";
import "./style.scss";
import { modIconList } from "../../../../../constants";
import { ReactComponent as Blur } from "../../../../../assets/icons-dark/t-blur.svg";
import { ReactComponent as Compress } from "../../../../../assets/icons-dark/t-compress.svg";
import { ReactComponent as Extend } from "../../../../../assets/icons-dark/t-extend.svg";
import { ReactComponent as Flip } from "../../../../../assets/icons-dark/t-flip.svg";
import { ReactComponent as Flop } from "../../../../../assets/icons-dark/t-flop.svg";
import { ReactComponent as Resize } from "../../../../../assets/icons-dark/t-resize.svg";
import { ReactComponent as Sharpen } from "../../../../../assets/icons-dark/t-sharpen.svg";

interface iconProps {
	src: string;
	name: string;
	isDisabled: boolean;
	pluginTheme: string;
}

function darkIconCheck(name) {
	let found = false;
	for (let i = 0; i < modIconList.length; i++) {
		if (modIconList[i].toLowerCase() === name.toLowerCase()) {
			found = true;
			break;
		}
	}
	return found;
}

function getIcon(name) {
	switch (name.toLowerCase()) {
		case "blur":
			return <Blur />;
		case "compress":
			return <Compress />;
		case "extend":
			return <Extend />;
		case "flip":
			return <Flip />;
		case "flop":
			return <Flop />;
		case "resize":
			return <Resize />;
		case "sharpen":
			return <Sharpen />;
		default:
			return null;
	}
}

function TansformationIcon({
	src,
	name,
	isDisabled = false,
	pluginTheme,
}: iconProps) {
	useEffect(() => {
		console.log("Plugintheme");
	}, [pluginTheme]);

	return (
		<div
			className={`icon-container ${
				isDisabled ? "disabled-transformation" : ""
			}`}
		>
			<div className="icon">
				{pluginTheme === "light" && darkIconCheck(name) ? (
					getIcon(name)
				) : (
					<img src={src} alt="img" className="icon-img" />
				)}
			</div>
			<div className="icon-desc">{name}</div>
		</div>
	);
}

export default TansformationIcon;
