import React from "react";
import "./style.scss";
import Divider from "../../Divider";
import { ReactComponent as CloseIcon } from "../../../../assets/close.svg";

interface drawerProps {
	toggler: () => void;
}

function TransformationsDrawer({ toggler }: drawerProps) {
	return (
		<div className="transformations-drawer">
			<Divider />
			<div className="header">
				<div className="main-heading">Transforations</div>
				<CloseIcon className="close-icon" onClick={toggler} />
			</div>
			<Divider />
		</div>
	);
}

export default TransformationsDrawer;
