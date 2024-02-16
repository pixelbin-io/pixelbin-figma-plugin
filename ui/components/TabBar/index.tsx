import React, { useState } from "react";
import "./style.scss";
import { ReactComponent as LinkIcon } from "../../../assets/hyperlink.svg";
import Divider from "../Divider";

interface tabBarProps {
	isImageSelected: boolean;
	isTranFormed: boolean;
	url: string;
	onLinkCopy: () => void;
}

function TabBar({ isImageSelected, isTranFormed, onLinkCopy }: tabBarProps) {
	const [tabID, setTabId] = useState(1);

	return (
		<div
			className={`container ${
				!isImageSelected ? "empty-tabbar" : "add-border"
			}`}
		>
			{isImageSelected ? (
				<>
					<div className="tab-container">
						<div
							onClick={() => {
								setTabId(1);
							}}
							className={`tab ${tabID === 1 ? "active-tab" : ""}`}
						>
							Original
						</div>
						{isTranFormed && (
							<div
								onClick={() => {
									setTabId(2);
								}}
								className={`tab ${tabID === 2 ? "active-tab" : ""}`}
							>
								Transformed
							</div>
						)}
					</div>
					{isTranFormed && (
						<LinkIcon
							className="link-icon"
							onClick={onLinkCopy}
							style={{ cursor: "pointer" }}
						/>
					)}
				</>
			) : null}
		</div>
	);
}

export default TabBar;
