import React, { useEffect, useState } from "react";
import TansformationIcon from "../TansformationIcon";
import { ReactComponent as Magnifier } from "../../../../../assets/magnifier.svg";
import "./style.scss";

interface gridProps {
	list: any;
	handleTransformationClick: (op: any) => void;
}
function TransformationGrid({ list, handleTransformationClick }: gridProps) {
	const [searchedValue, setSearchedValue] = useState("");
	const [filteredList, setFilteredList] = useState([]);

	useEffect(() => {
		setFilteredList([...list]);
	}, [list]);

	useEffect(() => {
		if (searchedValue.length) {
			let temp = list.filter((item) => {
				return item.op.displayName
					.toLowerCase()
					.includes(searchedValue.toLowerCase());
			});
			setFilteredList([...temp]);
		} else setFilteredList([...list]);
	}, [searchedValue, list]);

	return (
		<div className="transformation-container">
			<div className="tc-search">
				<input
					className="text-input-box"
					id="transformationSearch"
					type="text"
					value={searchedValue}
					onChange={(e) => {
						setSearchedValue(e.target.value);
					}}
					placeholder="Transformation name"
				/>
				<Magnifier className="magnifier" />
			</div>
			{filteredList.length ? (
				<div className="transformation-grid">
					{filteredList.map((item: any) => {
						return (
							<>
								<div
									onClick={() => {
										handleTransformationClick(item.op);
									}}
								>
									<TansformationIcon
										src={item.op.icon}
										name={item.op.displayName}
									/>
								</div>
							</>
						);
					})}
				</div>
			) : (
				<div className="error-container">No result found !</div>
			)}
		</div>
	);
}

export default TransformationGrid;
