import React, { useEffect, useState } from "react";
import { ReactComponent as Magnifier } from "../../../assets/magnifier.svg";
import "./style.scss";

interface searchProps {
	setValue: (val: string) => void;
	placeHolder?: string;
}

function SearchBox({ setValue, placeHolder = "Search..." }: searchProps) {
	const [currVal, setCurrVal] = useState("");
	return (
		<div className="search">
			<input
				className="text-input-box"
				id="transformationSearch"
				type="text"
				value={currVal}
				onChange={(e) => {
					setValue(e.target.value);
					setCurrVal(e.target.value);
				}}
				placeholder={placeHolder}
			/>
			<Magnifier className="magnifier" />
		</div>
	);
}

export default SearchBox;
