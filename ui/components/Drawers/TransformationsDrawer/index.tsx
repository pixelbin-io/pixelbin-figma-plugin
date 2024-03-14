import React, { useEffect, useState } from "react";
import "./style.scss";
import Divider from "../../Divider";
import { ReactComponent as CloseIcon } from "../../../../assets/close.svg";
import SearchBox from "../../SearchBox";
import TransformationGrid from "./TransformationGrid";

interface drawerProps {
	toggler: () => void;
	plugins: any;
	handleTransformationClick: (op: any) => void;
}

declare const Object: {
	entries: <T>(o: T) => [keyof T, T[keyof T]][];
};

function TransformationsDrawer({
	toggler,
	plugins,
	handleTransformationClick,
}: drawerProps) {
	const [aiTransformationList, setAiTransformationList] = useState([]);
	const [basicTransformationsList, setBasicTransformationsList] = useState([]);
	const [searchedValue, setSearchedValue] = useState("");
	const [tabID, setTabId] = useState("ai");

	useEffect(() => {
		filterTransformationList();
	}, []);

	const sortTransformationByName = (itemList) => {
		return itemList.sort((a, b) =>
			a?.op?.displayName > b?.op?.displayName
				? 1
				: b.op.displayName > a.op.displayName
				? -1
				: 0
		);
	};

	const filterTransformationList = () => {
		let aiTransformation = [];
		let basicTransformations = [];

		Object.entries(plugins).map(([, plugin]) => {
			plugin.operations.map((op) => {
				if (plugin?.name !== "Basic" && !plugin.credentials?.required)
					return (aiTransformation = [...aiTransformation, { plugin, op }]);
				else if (plugin?.name === "Basic") {
					return (basicTransformations = [
						...basicTransformations,
						{ plugin, op },
					]);
				}
			});
		});

		const updatedTransformationList =
			sortTransformationByName(aiTransformation);

		// the first four sequence is fixed for the AI transformation list
		const identifierSequence = ["wm", "wmc", "erase", "sr"];

		const transformationListObj = updatedTransformationList.reduce(
			(acc, eachTransform) => {
				const identifier = eachTransform?.plugin?.identifier;
				acc[identifier] = eachTransform;
				return acc;
			},
			{}
		);

		updatedTransformationList.forEach((eachTransform) => {
			const identifier = eachTransform?.plugin?.identifier;
			if (identifier && identifierSequence.indexOf(identifier) === -1) {
				identifierSequence.push(identifier);
			}
		});

		setAiTransformationList(
			identifierSequence
				.map((eachSequence) => transformationListObj[eachSequence])
				.filter(
					(item) =>
						item.plugin.name !== "PdfWatermarkRemoval" &&
						item.plugin.name !== "VideoWatermarkRemoval"
				)
		);

		setBasicTransformationsList(
			sortTransformationByName(
				basicTransformations.filter(
					(item) => item.op.displayName !== "Change Format"
				)
			)
		);
	};

	return (
		<div className="transformations-drawer">
			<Divider />
			<div className="header">
				<div style={{ flex: 1 }}>
					<SearchBox setValue={setSearchedValue} />
				</div>
				<CloseIcon className="close-icon" onClick={toggler} />
			</div>
			<Divider />
			<TransformationGrid
				list={[...aiTransformationList, ...basicTransformationsList]}
				handleTransformationClick={handleTransformationClick}
				searchedValue={searchedValue}
			/>
		</div>
	);
}

export default TransformationsDrawer;
