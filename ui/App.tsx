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
	const [transformationQueue, setTransformationQueue] = useState([]);
	const [isFormReEditing, setIsFormReEditing] = useState(false);
	const [index, setIndex] = useState(-1);
	const [cloudName, setCloudName] = useState("");
	const [imageBytes, setImageBytes] = useState([]);
	const [isTransformationApplied, setIsTransformationApplied] = useState(false);
	const [seletedTabId, setSelectedTabId] = useState(1);
	const [currentFigmaCmd, setCurrentFigmaCmd] = useState("");

	const {
		INITIAL_CALL,
		CREATE_FORM,
		TOGGLE_LOADER,
		IS_TOKEN_SAVED,
		SAVE_TOKEN,
		REPLACE_IMAGE,
		DELETE_TOKEN,
		ON_SELECTION_CHANGE,
		NOTIFY_USER,
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
				// console.log("Plugins", data?.plugins);
			}
		} catch (err) {}
	}

	window.onmessage = async (event) => {
		const { data } = event;

		if (data.pluginMessage.type === ON_SELECTION_CHANGE) {
			if (data.pluginMessage.imageBytes === null) {
				setImgUrl("");
			} else {
				setImageBytes([data.pluginMessage.imageBytes]);
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

		if (data.pluginMessage.type === CREATE_FORM) {
			setIsTokenEditOn(false);
			setIsTokenSaved(true);
		}

		if (data.pluginMessage.type === TOGGLE_LOADER)
			setIsLoading(data.pluginMessage.value);
		if (data.pluginMessage.type === "isTransformationApplied") {
			setIsTransformationApplied(data.pluginMessage.value);
			if (data.pluginMessage.value) setTransformedUrl(data.pluginMessage.url);
			else setTransformedUrl("");
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

	async function onRefreshClick() {
		setIsLoading(true);
		let t = null;
		transformationQueue.forEach((item, index) => {
			const { pluginName, method } = item.op;
			if (index !== 0) {
				//If its a not a first operation queue we have to pipe it
				if (!item.op.params.length) {
					t = t.pipe(eval(`${pluginName.split(" ").join("")}.${method}`)());
				} else {
					t = t.pipe(
						eval(`${pluginName.split(" ").join("")}.${method}`)({
							...item.selectedFormValues,
						})
					);
				}
			} else {
				//If its a first operation queue
				if (!item.op.params.length) {
					t = eval(`${pluginName.split(" ").join("")}.${method}`)();
				} else {
					const { pluginName, method } = item.op;
					t = eval(`${pluginName.split(" ").join("")}.${method}`)({
						...item.selectedFormValues,
					});
				}
			}
		});
		let name = `${uuidv4()}`;

		var pixelbin = new Pixelbin({
			cloudName: cloudName,
			zone: "default", // optional
		});

		let res = await defaultPixelBinClient.assets.createSignedUrlV2({
			...createSignedURlDetails,
			name: name,
		});

		let blob = new Blob(imageBytes, { type: "image/jpeg" });

		const EraseBg = transformations.EraseBG;

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
			})
			.catch((err) => {
				setIsLoading(false);
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
		} else
			setTransformationQueue([
				...transformationQueue,
				{ op: { ...data.op, pluginName: data.pluginName } },
			]);
	}

	function onTransformationApply(data) {
		dynamicFormToggler();
		setIsFormReEditing(false);
		if (isFormReEditing) {
			let temp = transformationQueue;
			temp[index] = data;
			setTransformationQueue([...temp]);
			setIndex(-1);
		} else {
			setTransformationQueue([...transformationQueue, data]);
		}
	}

	const QueDrawerClose = () => setTransformationQueue([]);

	async function setCreditsDetails() {
		if (tokenValue && tokenValue !== null) {
			try {
				const newData = await defaultPixelBinClient.billing.getUsage();
				const cu = newData.credits.used;
				const cr = newData?.total?.credits;
				setCreditUSed(cu);
				setTotalCredit(cr);
			} catch (err) {}
		}
	}
	function onDeleteClick(index: number) {
		const updatedQueue = transformationQueue.filter((_, i) => i !== index);
		setTransformationQueue([...updatedQueue]);
	}

	function onArrowClick(index: number, data: any) {
		setIndex(index);
		dynamicFormToggler();
		setCurrentOP(data.op);
		setIsFormReEditing(true);
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
							/>
							<ImageCanvas
								url={imgUrl}
								transFormedUrl={transFormedUrl}
								isRefereshEnabled={!!(transformationQueue.length && imgUrl)}
								onRefreshClick={onRefreshClick}
								selectedTabId={seletedTabId}
							/>
							{isTransformationsDrawerOpen && (
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
									selectedValues={
										isFormReEditing ? transformationQueue[index] : null
									}
									index={isFormReEditing ? index : null}
									tokenValue={tokenValue}
									cloudName={cloudName}
									setIsLoading={setIsLoading}
								/>
							)}
							{imgUrl && (
								<div
									onClick={transformationsDrawerToggle}
									className="icon--plus icon--white plus-button"
								/>
							)}
							{transformationQueue.length ? (
								<QueuedTransformationsDrawer
									closeFunc={QueDrawerClose}
									queue={transformationQueue}
									onDeleteClick={onDeleteClick}
									onArrowClick={onArrowClick}
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
							showErrMessage={() => {
								parent.postMessage(
									{
										pluginMessage: {
											type: NOTIFY_USER,
											value: "Something Went wrong !!!",
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
