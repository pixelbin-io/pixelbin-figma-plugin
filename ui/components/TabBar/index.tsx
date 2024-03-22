import React, { useState } from "react";
import "./style.scss";
import { ReactComponent as LinkIcon } from "../../../assets/hyperlink.svg";
import Divider from "../Divider";

interface tabBarProps {
	isImageSelected: boolean;
	isTranFormed: boolean;
	url: string;
	onLinkCopy: () => void;
	setSelectedTabId: (id: number) => void;
	tabID: number;
	onRevertClick: () => void;
}

function TabBar({
	isImageSelected,
	isTranFormed,
	onLinkCopy,
	setSelectedTabId,
	tabID,
	onRevertClick,
}: tabBarProps) {
	const [isLinkHovered, setIsLinkHovered] = useState(false);
	const [isRevertHovered, setIsRevertHovered] = useState(false);

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
								setSelectedTabId(1);
							}}
							className={`tab ${tabID === 1 ? "active-tab" : ""}`}
						>
							Original
						</div>
						{isTranFormed && (
							<div
								onClick={() => {
									setSelectedTabId(2);
								}}
								className={`tab ${tabID === 2 ? "active-tab" : ""}`}
							>
								Transformed
							</div>
						)}
					</div>
					{isTranFormed && (
						<div className="symbol-container">
							<div
								className="icon icon--swap icon--blue reset-icon"
								onClick={() => {
									onRevertClick();
									setIsRevertHovered(false);
								}}
								onMouseEnter={() => setIsRevertHovered(true)}
								onMouseLeave={() => setIsRevertHovered(false)}
								style={{ cursor: "pointer" }}
							/>
							<LinkIcon
								className="link-icon"
								onClick={onLinkCopy}
								onMouseEnter={() => setIsLinkHovered(true)}
								onMouseLeave={() => setIsLinkHovered(false)}
								style={{ cursor: "pointer" }}
							/>
						</div>
					)}
					{isLinkHovered && (
						<div className="info-box">
							Copy link/adress of the transformed image
						</div>
					)}
					{isRevertHovered && (
						<div className="info-box-revert">Revert to original image</div>
					)}
				</>
			) : null}
		</div>
	);
}

export default TabBar;
