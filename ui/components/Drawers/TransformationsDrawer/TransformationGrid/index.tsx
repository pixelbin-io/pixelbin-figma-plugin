import React, { useEffect, useState } from "react";
import TansformationIcon from "../TansformationIcon";
import SearchBox from "../../../SearchBox";
import "./style.scss";

interface gridProps {
	list: any;
	handleTransformationClick: (op: any) => void;
}
function TransformationGrid({ list, handleTransformationClick }: gridProps) {
	const [searchedValue, setSearchedValue] = useState("");
	const [filteredList, setFilteredList] = useState([]);

	useEffect(() => {
		let x = list.filter(
			(item, index) => item?.plugin?.operations[0]?.returnType !== "json"
		);

		if (searchedValue.length) {
			let temp = x.filter((item) => {
				return item.op.displayName
					.toLowerCase()
					.includes(searchedValue.toLowerCase());
			});
			setFilteredList([...temp]);
		} else setFilteredList([...x]);
	}, [searchedValue, list]);

	return (
		<div className="transformation-container">
			<SearchBox setValue={setSearchedValue} />
			{filteredList.length ? (
				<div className="transformation-grid">
					{filteredList.map((item: any) => {
						return (
							<>
								<div
									onClick={() => {
										handleTransformationClick({
											op: item.op,
											pluginName: item.plugin.name,
										});
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
