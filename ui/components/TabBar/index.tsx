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
}

function TabBar({
	isImageSelected,
	isTranFormed,
	onLinkCopy,
	setSelectedTabId,
	tabID,
}: tabBarProps) {
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
						{isTranFormed && (
							<div
								onClick={() => {
									setSelectedTabId(3);
								}}
								className={`tab ${tabID === 3 ? "active-tab" : ""}`}
							>
								Context
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
