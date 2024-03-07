import React from "react";
import "./style.scss";

interface iconProps {
	src: string;
	name: string;
}

function TansformationIcon({ src, name }: iconProps) {
	return (
		<div className="icon-container">
			<div className="icon">
				<img src={src} alt="img" className="icon-img" />
			</div>
			<div className="icon-desc">{name}</div>
		</div>
	);
}

export default TansformationIcon;
