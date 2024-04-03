import React, { useEffect, useState } from "react";
import TansformationIcon from "../TansformationIcon";

import "./style.scss";

interface gridProps {
	list: any;
	handleTransformationClick: (op: any) => void;
	searchedValue: string;
	isUpscaleDisabled: boolean;
	pluginTheme: string;
}
function TransformationGrid({
	list,
	searchedValue,
	handleTransformationClick,
	isUpscaleDisabled,
	pluginTheme,
}: gridProps) {
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
			{filteredList.length ? (
				<div className="transformation-grid">
					{filteredList.map((item: any) => {
						return (
							<div
								key={item.op.displayName}
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
									isDisabled={
										item.op.displayName.toLowerCase() === "upscale" &&
										isUpscaleDisabled
									}
									pluginTheme={pluginTheme}
								/>
							</div>
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
