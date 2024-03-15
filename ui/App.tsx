import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { PdkAxios } from "@pixelbin/admin/common.js";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import {
	EVENTS,
	createSignedURlDetails,
	uploadOptions,
	COMMANDS,
} from "./../constants";
import "./styles/style.app.scss";
import Pixelbin, { transformations } from "@pixelbin/core";
import { API_PIXELBIN_IO } from "../config";
import CreditsUI from "./components/CreditsUI/index.tsx";
import TokenUI from "./components/TokenUI";
import Loader from "./components/Loader/index.tsx";
import TabBar from "./components/TabBar/index.tsx";
import ImageCanvas from "./components/ImageCanvas/index.tsx";
import Divider from "./components/Divider/index.tsx";
import TransformationsDrawer from "./components/Drawers/TransformationsDrawer/index.tsx";
import DynamicFormDrawer from "./components/Drawers/DynamicFormDrawer/index.tsx";
import copy from "copy-to-clipboard";
import QueuedTransformationsDrawer from "./components/Drawers/QueuedTransformationsDrawer/index.tsx";
import ImageUploader from "./components/ImageUploader/index.tsx";
import ImageDownloader from "./components/ImageDownloader/index.tsx";

PdkAxios.defaults.withCredentials = false;

function App() {
	const [isLoading, setIsLoading] = useState(false);
	const [isTokenSaved, setIsTokenSaved] = useState(false);
	const [tokenValue, setTokenValue] = useState(null);
	const [tokenErr, setTokenErr] = useState(false);
	const [isTokenEditOn, setIsTokenEditOn] = useState(false);
	const [creditsUsed, setCreditUSed] = useState(0);
	const [totalCredit, setTotalCredit] = useState(0);
	const [orgId, setOrgId] = useState("");
	const [imgUrl, setImgUrl] = useState("");
	const [transFormedUrl, setTransformedUrl] = useState("");
	const [isTransformationsDrawerOpen, setIsTransformationsDrawerOpen] =
		useState(false);
	const [plugins, setPlugins] = useState({});
	const [isDynamicFormOpen, setIsDynamicFormOpen] = useState(false);
	const [currentOp, setCurrentOP] = useState({});
	const [isFormReEditing, setIsFormReEditing] = useState(false);
	const [index, setIndex] = useState(-1);
	const [cloudName, setCloudName] = useState("");
	const [imageBytes, setImageBytes] = useState([]);
	const [isTransformationApplied, setIsTransformationApplied] = useState(false);
	const [seletedTabId, setSelectedTabId] = useState(1);
	const [currentFigmaCmd, setCurrentFigmaCmd] = useState("");
	const [imgName, setImgName] = useState("");
	const {
		INITIAL_CALL,

		TOGGLE_LOADER,
		IS_TOKEN_SAVED,
		SAVE_TOKEN,
		REPLACE_IMAGE,
		DELETE_TOKEN,
		ON_SELECTION_CHANGE,
		NOTIFY_USER,
		IS_TRANSFORMATION_APPLIED,
		TOKEN_SAVED,
		CHANGE_TAB_ID,
		DISCARD_CHANGES,
	} = EVENTS;

	useEffect(() => {
		parent.postMessage(
			{
				pluginMessage: {
					type: INITIAL_CALL,
				},
			},
			"*"
		);
	}, []);

	let defaultPixelBinClient: PixelbinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${API_PIXELBIN_IO}`,
			apiSecret: tokenValue,
		})
	);

	async function getOperations() {
		try {
			if (tokenValue) {
				let data = await defaultPixelBinClient.assets.getModules();
				setPlugins(data?.plugins);
				setIsTransformationsDrawerOpen(true);
			}
		} catch (err) {
			parent.postMessage(
				{
					pluginMessage: {
						type: NOTIFY_USER,
						value: "Something went wrong",
					},
				},
				"*"
			);
		}
	}

	window.onmessage = async (event) => {
		const { data } = event;

		if (data.pluginMessage.type === ON_SELECTION_CHANGE) {
			if (data.pluginMessage.imageBytes === null) {
				setImgUrl("");
			} else {
				setImageBytes([data.pluginMessage.imageBytes]);
				setImgName(data.pluginMessage.imgName);
				function bytesToDataURL(bytes, contentType) {
					const blob = new Blob([new Uint8Array(bytes)], { type: contentType });
					return URL.createObjectURL(blob);
				}
				const imageBytes = data.pluginMessage.imageBytes;
				const contentType = "image/png";

				const imageUrl = bytesToDataURL(imageBytes, contentType);

				setImgUrl(imageUrl);
			}
		}
		if (data.pluginMessage.type === CHANGE_TAB_ID) {
			setSelectedTabId(data.pluginMessage.tabId);
		}
		if (data.pluginMessage.type === IS_TOKEN_SAVED) {
			setIsTokenSaved(data.pluginMessage.value);
			setIsTokenEditOn(data.pluginMessage.isTokenEditing);
			if (data.pluginMessage.value) {
				setTokenValue(data.pluginMessage.savedToken);
				setOrgId(data.pluginMessage.orgId);
				setCloudName(data.pluginMessage.savedCloudName);
			}
			setCurrentFigmaCmd(data.pluginMessage.command);
		}

		if (data.pluginMessage.type === TOKEN_SAVED) {
			setIsTokenEditOn(false);
			setIsTokenSaved(true);
			setCloudName(data.pluginMessage.cloudName);
			setCurrentFigmaCmd(data.pluginMessage.command);
		}

		if (data.pluginMessage.type === TOGGLE_LOADER)
			setIsLoading(data.pluginMessage.value);
		if (data.pluginMessage.type === IS_TRANSFORMATION_APPLIED) {
			setIsTransformationApplied(data.pluginMessage.value);
			if (data.pluginMessage.value) {
				setTransformedUrl(data.pluginMessage.url);
				setSelectedTabId(2);
			} else setTransformedUrl("");
		}
	};

	function isUploadSuccess(msg: string) {
		parent.postMessage(
			{
				pluginMessage: {
					type: NOTIFY_USER,
					value: msg,
				},
			},
			"*"
		);
	}

	async function onTransformationApply(data) {
		setIsFormReEditing(false);
		setIsLoading(true);
		let t = null;
		if (!data.op.params.length) {
			t = eval(`${data.op.pluginName.split(" ").join("")}.${data.op.method}`)();
		} else {
			const { pluginName, method } = data.op;
			t = eval(`${pluginName.split(" ").join("")}.${method}`)({
				...data.selectedFormValues,
			});
		}

		let name = `${uuidv4()}`;

		var pixelbin = new Pixelbin({
			cloudName: cloudName,
			zone: "default",
		});

		let res = await defaultPixelBinClient.assets.createSignedUrlV2({
			...createSignedURlDetails,
			name: name,
		});

		let blob = new Blob(imageBytes, { type: "image/jpeg" });

		return Pixelbin.upload(blob as any, res.presignedUrl, uploadOptions)
			.then(() => {
				const url = JSON.parse(
					res.presignedUrl.fields["x-pixb-meta-assetdata"]
				);
				const demoImage = pixelbin.image(url?.fileId);
				demoImage.setTransformation(t);
				parent.postMessage(
					{
						pluginMessage: {
							type: REPLACE_IMAGE,
							transformedUrl: demoImage.getUrl(),
						},
					},
					"*"
				);
				setCreditsDetails();
				QueDrawerClose();
				setIsDynamicFormOpen(false);
			})
			.catch((err) => {
				setIsLoading(false);
				setIsDynamicFormOpen(false);
			});
	}

	function copyLink() {
		copy(transFormedUrl);
		parent.postMessage(
			{
				pluginMessage: {
					type: NOTIFY_USER,
					value: "Url copied to clipboard",
				},
			},
			"*"
		);
	}

	async function handleTokenSave() {
		setTokenErr(false);
		setIsLoading(true);

		try {
			const orgDetails =
				await defaultPixelBinClient.organization.getAppOrgDetails();
			parent.postMessage(
				{
					pluginMessage: {
						type: SAVE_TOKEN,
						value: tokenValue,
						cloudName: orgDetails?.org?.cloudName,
						orgId: orgDetails?.app?.orgId,
					},
				},
				"*"
			);
			setIsLoading(false);
			setIsTokenEditOn(false);
		} catch (err) {
			setTokenErr(true);
			setIsLoading(false);
		}
	}

	function handleTokenDelete() {
		setTokenValue(null);
		parent.postMessage(
			{
				pluginMessage: {
					type: DELETE_TOKEN,
				},
			},
			"*"
		);
	}

	const transformationsDrawerToggle = () =>
		setIsTransformationsDrawerOpen(!isTransformationsDrawerOpen);

	const dynamicFormToggler = () => setIsDynamicFormOpen(!isDynamicFormOpen);

	function handleTransformationClick(data: any) {
		setCurrentOP({ ...data.op, pluginName: data.pluginName });
		transformationsDrawerToggle();
		setIsFormReEditing(false);
		if (data.op.params.length) {
			dynamicFormToggler();
		} else {
			onTransformationApply({
				op: { ...data.op, pluginName: data.pluginName },
			});
		}
	}

	const QueDrawerClose = () => {
		setIsTransformationsDrawerOpen(true);
	};

	async function setCreditsDetails() {
		if (tokenValue && tokenValue !== null) {
			try {
				const newData = await defaultPixelBinClient.billing.getUsage();
				const cu = newData.credits.used;
				const cr = newData?.total?.credits;
				setCreditUSed(cu);
				setTotalCredit(cr);
			} catch (err) {
				parent.postMessage(
					{
						pluginMessage: {
							type: NOTIFY_USER,
							value: "Url copied to clipboard",
						},
					},
					"*"
				);
			}
		}
	}

	useEffect(() => {
		setCreditsDetails();
		getOperations();
	}, [tokenValue]);

	return (
		<div className={`main-container ${isLoading ? "hide-overflow" : ""}`}>
			{isTokenSaved && !isTokenEditOn ? (
				<div className="main-ui-container">
					{currentFigmaCmd === COMMANDS.OPEN_PIXELBIN_CMD && (
						<>
							<CreditsUI
								creditUSed={creditsUsed}
								totalCredit={totalCredit}
								orgId={orgId}
							/>
							<Divider />
							<TabBar
								isImageSelected={!!imgUrl.length}
								isTranFormed={isTransformationApplied}
								url={transFormedUrl}
								onLinkCopy={copyLink}
								setSelectedTabId={setSelectedTabId}
								tabID={seletedTabId}
							/>
							<ImageCanvas
								url={imgUrl}
								transFormedUrl={transFormedUrl}
								selectedTabId={seletedTabId}
								onDiscardClick={() => {
									parent.postMessage(
										{
											pluginMessage: {
												type: DISCARD_CHANGES,
												url: imgUrl,
											},
										},
										"*"
									);
									setSelectedTabId(1);
									setIsTransformationApplied(false);
								}}
							/>
							{isTransformationsDrawerOpen && imgUrl && (
								<TransformationsDrawer
									toggler={transformationsDrawerToggle}
									plugins={plugins}
									handleTransformationClick={handleTransformationClick}
								/>
							)}
							{isDynamicFormOpen && (
								<DynamicFormDrawer
									toggler={dynamicFormToggler}
									operation={currentOp}
									url={imgUrl}
									onTransformationApply={onTransformationApply}
									index={isFormReEditing ? index : null}
									tokenValue={tokenValue}
									cloudName={cloudName}
									setIsLoading={setIsLoading}
								/>
							)}
							{!isTransformationsDrawerOpen ? (
								<div
									onClick={transformationsDrawerToggle}
									className="icon--plus icon--white plus-button"
								/>
							) : null}
						</>
					)}
					{currentFigmaCmd === COMMANDS.UPLOAD_CMD && (
						<ImageUploader
							cloudName={cloudName}
							tokenValue={tokenValue}
							isUploadSuccess={isUploadSuccess}
							setIsLoading={setIsLoading}
							imgUrl={imgUrl}
							imageBytes={imageBytes}
							imgName={imgName}
							showErrMessage={() => {
								parent.postMessage(
									{
										pluginMessage: {
											type: NOTIFY_USER,
											value: "Something Went wrong!",
										},
									},
									"*"
								);
							}}
						/>
					)}
					{currentFigmaCmd === COMMANDS.DOWNLOAD_CMD && (
						<ImageDownloader
							setIsLoading={setIsLoading}
							tokenValue={tokenValue}
							showErrMessage={() => {
								parent.postMessage(
									{
										pluginMessage: {
											type: NOTIFY_USER,
											value: "Something Went wrong!",
										},
									},
									"*"
								);
							}}
						/>
					)}
				</div>
			) : (
				<TokenUI
					tokenValue={tokenValue}
					tokenErr={tokenErr}
					setTokenValue={setTokenValue}
					handleTokenDelete={handleTokenDelete}
					handleTokenSave={handleTokenSave}
				/>
			)}
			{isLoading && <Loader />}
		</div>
	);
}

export default App;
