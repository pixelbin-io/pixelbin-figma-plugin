import React from "react";
import LoaderGif from "../../../assets/loader.gif";
import "./style.scss";

function Loader() {
	return (
		<div className="loader-modal">
			<div className="loader-img-container">
				<img src={LoaderGif} alt="Loader" height={50} width={50} />
			</div>
		</div>
	);
}

export default Loader;
