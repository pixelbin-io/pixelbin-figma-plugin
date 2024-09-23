import React, { useEffect, useState } from "react";
import "./style.scss";
import Divider from "../../Divider";
import SearchBox from "../../SearchBox";
import TransformationGrid from "./TransformationGrid";
import { allowedPlugins } from "../../../../constants";

interface drawerProps {
	toggler: () => void;
	plugins: any;
	handleTransformationClick: (op: any) => void;
	imageNaturalDimensions: any;
	pluginTheme: string;
}

declare const Object: {
	entries: <T>(o: T) => [keyof T, T[keyof T]][];
};

function TransformationsDrawer({
	toggler,
	plugins,
	handleTransformationClick,
	imageNaturalDimensions,
	pluginTheme,
}: drawerProps) {
	const [aiTransformationList, setAiTransformationList] = useState([]);
	const [basicTransformationsList, setBasicTransformationsList] = useState([]);
	const [searchedValue, setSearchedValue] = useState("");

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

		Object.entries(plugins).forEach(([_, plugin]) => {
			if (allowedPlugins?.[plugin.identifier] !== undefined) {
				plugin?.operations?.forEach((op) => {
					if (
						allowedPlugins?.[plugin?.identifier]?.operations?.includes(
							op.displayName
						)
					) {
						if (plugin?.name !== "Basic" && !plugin.credentials?.required)
							aiTransformation = [...aiTransformation, { plugin, op }];
						else if (plugin?.name === "Basic") {
							basicTransformations = [...basicTransformations, { plugin, op }];
						}
					}
				});
			}
		});

		const updatedTransformationList =
			sortTransformationByName(aiTransformation);

		// the first three sequence is fixed for the AI transformation list
		const identifierSequence = ["wm", "erase", "sr"];

		const transformationListObj = updatedTransformationList.reduce(
			(acc, eachTransform, index) => {
				const identifier = eachTransform?.plugin?.identifier;
				if (!acc[identifier]) acc[identifier] = eachTransform;
				else {
					acc[`${identifier}${index}`];
				}
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
			identifierSequence.map(
				(eachSequence) => transformationListObj[eachSequence]
			)
		);

		setBasicTransformationsList(sortTransformationByName(basicTransformations));
	};

	return (
		<div className="transformations-drawer">
			<Divider />
			<div className="header">
				<div style={{ flex: 1 }}>
					<SearchBox setValue={setSearchedValue} />
				</div>
			</div>
			<Divider />
			<TransformationGrid
				list={[...aiTransformationList, ...basicTransformationsList]}
				handleTransformationClick={handleTransformationClick}
				searchedValue={searchedValue}
				isUpscaleDisabled={
					imageNaturalDimensions.height > 1499 ||
					imageNaturalDimensions.width > 1499
				}
				pluginTheme={pluginTheme}
			/>
		</div>
	);
}

export default TransformationsDrawer;
