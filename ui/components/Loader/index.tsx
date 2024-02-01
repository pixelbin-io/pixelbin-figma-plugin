import React from "react";
import LoaderGif from "../../../assets/loader.gif";
import "./style.scss";

interface loaderProps {
	isCancellable?: boolean;
	onCancelClick?: () => void;
}

function Loader({
	isCancellable = false,
	onCancelClick = () => {},
}: loaderProps) {
	return (
		<div className="loader-modal">
			<div className="loader-img-container">
				<img src={LoaderGif} alt="Loader" height={50} width={50} />
			</div>
			<div>
				{isCancellable && (
					<div className="loader-cancel-container">
						<button
							id="submit-token"
							onClick={onCancelClick}
							className="button button--primary loader-cancl-btn"
						>
							Cancel
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default Loader;
