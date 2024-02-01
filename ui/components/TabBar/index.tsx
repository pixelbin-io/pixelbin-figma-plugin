import React, { useState } from "react";
import "./style.scss";
import { ReactComponent as LinkIcon } from "../../../assets/hyperlink.svg";

function TabBar() {
	const [tabID, setTabId] = useState(1);
	return (
		<div className="container">
			<div className="tab-container">
				<div
					onClick={() => {
						setTabId(1);
					}}
					className={`tab ${tabID === 1 ? "active-tab" : ""}`}
				>
					Original
				</div>
				<div
					onClick={() => {
						setTabId(2);
					}}
					className={`tab ${tabID === 2 ? "active-tab" : ""}`}
				>
					Transformed
				</div>
			</div>
			<LinkIcon className="link-icon" />
		</div>
	);
}

export default TabBar;
