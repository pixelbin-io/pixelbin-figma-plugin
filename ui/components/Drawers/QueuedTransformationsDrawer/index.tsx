import React, { useEffect } from "react";
import Divider from "../../Divider";
import { ReactComponent as TrashCan } from "../../../../assets/trashcan.svg";
import { Util } from "../../../../util";
import "./style.scss";

interface qtdProps {
	closeFunc: () => void;
	queue: Array<any>;
	onDeleteClick: (index: number) => void;
	onArrowClick: (index: number, selectedFormValues: any) => void;
}

function QueuedTransformationsDrawer({
	closeFunc,
	queue,
	onDeleteClick,
	onArrowClick,
}: qtdProps) {
	return (
		<div className="qtd-container">
			<Divider />
			<div className="header">
				<div className="name">Transformations {`(${queue.length})`}</div>
				<div
					className="clear"
					onClick={() => {
						closeFunc();
					}}
				>
					Clear All
				</div>
			</div>
			<Divider />
			<div className="queue-container">
				{queue.map((item, index) => (
					<div className="transformation-card">
						{/* Header */}
						<div className="tc-header">
							<div className="tc-h-left">
								<img src={item.op.icon} className="tc-img" />
								<div className="tc-name">{item.op.displayName}</div>
							</div>
							<div className="tc-h-right">
								<TrashCan
									className="trash-icon"
									onClick={() => onDeleteClick(index)}
								/>
								{item.selectedFormValues ? (
									<div
										className="tc-arrow"
										onClick={() => onArrowClick(index, item)}
									>
										›
									</div>
								) : null}
							</div>
						</div>
						{/* Body */}
						{item.selectedFormValues ? (
							<div className="tc-body">
								{item.op.params.map((_, index) => {
									return (
										<div>
											<div className="tc-property-name">{_.name}</div>
											<div className="tc-property-value">
												{item?.selectedFormValues[
													Util.camelCase(_.name)
												]?.toString()}
											</div>
										</div>
									);
								})}
							</div>
						) : null}
					</div>
				))}
			</div>
		</div>
	);
}

export default QueuedTransformationsDrawer;
