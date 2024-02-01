import React, { useState } from "react";
import "../../styles/style.scss";

interface footerProps {
	handleReset: any;
	handleSubmit: any;
	isBtnDisabled: boolean;
}

function Footer({ handleReset, handleSubmit, isBtnDisabled }: footerProps) {
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
				disabled={isBtnDisabled}
			>
				Apply
			</button>
		</div>
	);
}

export default Footer;
