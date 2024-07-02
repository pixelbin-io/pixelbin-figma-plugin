import React, { useState, useEffect } from "react";
import { PIXELBIN_CONSOLE_SETTINGS } from "../../../config";
import { EVENTS, UTM_DETAILS } from "../../../constants";
import "./style.scss";

const { OPEN_EXTERNAL_URL } = EVENTS;

function handleLinkClick(url: string) {
	parent.postMessage(
		{
			pluginMessage: {
				type: OPEN_EXTERNAL_URL,
				url,
			},
		},
		"*"
	);
}

interface props {
	tokenValue?: string | null;
	tokenErr: boolean;
	handleTokenDelete: () => void;
	handleTokenSave: () => void;
	setTokenValue: (val: string | null) => void;
}

function TokenUI({
	tokenValue,
	tokenErr,
	handleTokenDelete,
	handleTokenSave,
	setTokenValue,
}: props) {
	const [isTokenTypePass, setIsTokenTypePass] = useState(true);

	return (
		<div className="api-key-ui">
			<div className="api-key-steps">
				<div>
					1. Go to the
					<span
						className="link"
						onClick={() => {
							handleLinkClick(
								`${PIXELBIN_CONSOLE_SETTINGS}/apps${UTM_DETAILS}`
							);
						}}
					>
						&nbsp;console.pixelbin.io
					</span>
					&nbsp;and create a free acount{" "}
					{`(you will need to confirm your email)`}
				</div>
				<br />
				<div>
					2. After that you can find your API token here
					<span
						className="link"
						onClick={() => {
							handleLinkClick(
								`${PIXELBIN_CONSOLE_SETTINGS}/apps${UTM_DETAILS}`
							);
						}}
					>
						&nbsp;https://console.pixelbin.io/orga...
					</span>
				</div>
				<div className="token-input-container">
					<input
						className="token-input-box"
						type={`${isTokenTypePass ? "password" : "text"}`}
						placeholder="Token here"
						onChange={(e) => {
							setTokenValue(e.target.value);
						}}
						value={tokenValue !== null ? tokenValue : ""}
					/>
					{
						<div>
							{tokenValue ? (
								isTokenTypePass ? (
									<div
										onClick={() => {
											setIsTokenTypePass(!isTokenTypePass);
										}}
										className="icon  icon--blue icon--visible"
									/>
								) : (
									<div
										onClick={() => {
											setIsTokenTypePass(!isTokenTypePass);
										}}
										className="icon  icon--blue icon--hidden
											"
									/>
								)
							) : null}
						</div>
					}
				</div>
				{tokenErr && <div className="token-err ">Invalid token.</div>}
			</div>

			<div
				className={`api-key-btn-container ${
					tokenValue ? "space-between" : "right"
				}`}
			>
				{tokenValue && (
					<div onClick={handleTokenDelete} className="delete-token-container">
						<div className="icon  icon--blue icon--trash"></div>
						<div className="reset-text" style={{ fontSize: 12 }}>
							Delete token
						</div>
					</div>
				)}

				<button
					id="submit-token"
					onClick={handleTokenSave}
					className="button button--primary"
					disabled={!tokenValue}
				>
					Save
				</button>
			</div>
		</div>
	);
}

export default TokenUI;
