import React from "react";
import TansformationIcon from "../TansformationIcon";
import "./style.scss";

interface gridProps {
	list: any;
	handleTransformationClick: (op: any) => void;
}
function TransformationGrid({ list, handleTransformationClick }: gridProps) {
	return (
		<div className="transformation-grid">
			{list.map((item: any) => {
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
	);
}

export default TransformationGrid;
