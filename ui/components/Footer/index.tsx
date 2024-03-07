import React, { useState } from "react";
import "./style.scss";

interface footerProps {
	handleReset: any;
	handleSubmit: any;
}

function Footer({ handleReset, handleSubmit }: footerProps) {
	return (
		<div className="bottom-btn-container">
			<div className="reset-container" id="reset" onClick={handleReset}>
				<div className="icon icon--swap icon--blue reset-icon"></div>
				<div className="reset-text">Reset all</div>
			</div>
			<button
				id="submit-btn"
				onClick={handleSubmit}
				className="button button--primary"
			>
				Apply
			</button>
		</div>
	);
}

export default Footer;
