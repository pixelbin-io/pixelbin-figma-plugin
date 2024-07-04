import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import {
	uploadOptions,
	EVENTS,
	UTM_DETAILS,
	INTEGRATION_PLATFORM,
} from "../../../constants";
import Pixelbin from "@pixelbin/core";
import { API_PIXELBIN_IO } from "../../../config";
import { Util } from "../../../util";
import { v4 as uuidv4 } from "uuid";
import { ReactComponent as Home } from "../../../assets/home.svg";
import Loader from "../Loader";

const { OPEN_EXTERNAL_URL } = EVENTS;

interface IUProps {
	cloudName: string;
	tokenValue: string;
	isUploadSuccess: (msg: string) => void;
	setIsLoading: (val: boolean) => void;
	showErrMessage: () => void;
	imgUrl: any;
	imageBytes;
	imgName;
}

function ImageUploader({
	cloudName,
	tokenValue,
	isUploadSuccess,
	setIsLoading,
	showErrMessage,
	imgUrl,
	imageBytes,
	imgName,
}: IUProps) {
	let defaultPixelBinClient: PixelbinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: API_PIXELBIN_IO,
			apiSecret: tokenValue,
			integrationPlatform: INTEGRATION_PLATFORM,
		})
	);

	function openExternalURl(url) {
		parent.postMessage(
			{
				pluginMessage: {
					type: OPEN_EXTERNAL_URL,
					url,
				},
			},
			"*"
		);
	}

	const modalRef = useRef(null);

	const staticFormValues = {
		image: null,
		imageName: "",
		tags: [],
	};
	const [formValues, setFormValues] = useState(staticFormValues);
	const [currentTag, setCurrentTag] = useState("");
	const [data, setData] = useState({
		name: "root",
		toggled: true,
		path: "root",
		children: [],
	});
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentFoldersList, setCurrrentFoldersList] = useState([]);
	const [pathsList, setPathsList] = useState([]);
	const [isLoadMoreEnabled, setIsLoadMoreEnabled] = useState(false);
	const [apiInstance, setAPIInstance] = useState(null);
	const [foldersNotFound, setFolderNotFound] = useState(true);
	const [storageUsed, setStorageUSed] = useState(0);
	const [totalStorage, setTotalStorage] = useState(0);
	const [isAccOpen, setIsAccOpen] = useState(true);
	const [isRouteDirectory, setIsRouteDirectory] = useState(true);
	const [foldersLoading, setFoldersLoading] = useState(false);
	const [isStorageLinkVisible, setIsStorageLinkVisisble] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (modalRef.current && !modalRef.current.contains(event.target)) {
				setIsModalOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	async function setStorageDetails() {
		setIsLoading(true);
		try {
			const usage = await defaultPixelBinClient.billing.getUsageV2();
			setStorageUSed(usage?.storage?.used);
			setTotalStorage(usage?.storage?.total);
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
		}
	}

	async function fetchFoldersList() {
		setSelectedIndex(-1);
		setIsLoading(true);
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: "",
			});
			setAPIInstance(temp);
			const { items, page } = await temp.next();
			setIsLoadMoreEnabled(temp.hasNext());
			let temp2 = items.filter((item, index) => item.path === "");
			setCurrrentFoldersList([...temp2]);
			setIsRouteDirectory(true);
			let x = data;
			setIsLoading(false);
			if (!items.length) setFolderNotFound(true);
			else setFolderNotFound(false);
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function loadMore() {
		setFoldersLoading(true);
		try {
			const { items, page } = await apiInstance.next();
			let temp = [
				...currentFoldersList,
				...(!pathsList.length
					? items.filter((item, index) => item.path === "")
					: items),
			];
			setCurrrentFoldersList([...temp]);
			setIsLoadMoreEnabled(apiInstance.hasNext());
			setFoldersLoading(false);
		} catch (err) {
			setFoldersLoading(false);
			showErrMessage();
		}
	}

	async function fetchByPath(list, index = -1) {
		setFoldersLoading(true);
		try {
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: list.join("/"),
			});
			setAPIInstance(temp);
			let oldInstance = apiInstance;
			const { items, page } = await temp.next();
			if (!items.length) {
				setFoldersLoading(false);
				setSelectedIndex(index);
				if (!list.length) setIsRouteDirectory(true);
				setAPIInstance(oldInstance);
				return;
			}
			setIsRouteDirectory(false);
			setSelectedIndex(-1);
			setIsLoadMoreEnabled(temp.hasNext());
			setCurrrentFoldersList([...items]);
			setPathsList([...list]);
			setFoldersLoading(false);
		} catch (err) {
			setFoldersLoading(false);
			showErrMessage();
		}
	}
	async function handleUpload() {
		try {
			setIsLoading(true);

			const regex = /\/([^\/]+)$/;

			let createSignedURlDetails = {
				path:
					selectedIndex > -1
						? [...pathsList, currentFoldersList[selectedIndex].name].join("/")
						: pathsList.join("/"),
				name: uuidv4(),
				access: "public-read",
				tags: [...formValues.tags],
				metadata: {},
			};

			let res = await defaultPixelBinClient.assets.createSignedUrlV2({
				...createSignedURlDetails,
				name: imgName,
			});

			Pixelbin.upload(formValues.image as any, res.presignedUrl, uploadOptions)
				.then(() => {
					isUploadSuccess("Uploaded successfully");
					setIsLoading(false);
					setStorageDetails();
					setIsStorageLinkVisisble(true);
					setTimeout(() => {
						setIsStorageLinkVisisble(false);
					}, 5000);
				})
				.catch((err) => {
					isUploadSuccess(err);
					setIsLoading(false);
				});
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	useEffect(() => {
		setFormValues({
			...formValues,
			image: new Blob(imageBytes, { type: "image/jpeg" }),
		});
	}, [imageBytes]);

	useEffect(() => {
		fetchFoldersList();
		setStorageDetails();
	}, []);

	return (
		<div className="uploader-main-container">
			<div className="uploader-form-container">
				<div
					onClick={() => setIsAccOpen(!isAccOpen)}
					className="accordion generic-text dropdown-label"
					style={{ marginTop: 8 }}
				>
					<div>Select Folder* &nbsp;</div>
				</div>

				<div
					style={{
						position: "relative",
						overflowY: `${foldersLoading ? "hidden" : "auto"}`,
					}}
				>
					{foldersLoading ? <Loader /> : null}
					<div>
						{pathsList.length < 3 ? (
							<div className="path-chain">
								<div className="chain-hook">
									<div
										className="hook-name"
										onClick={() => {
											setPathsList([]);
											fetchFoldersList();
										}}
									>
										<Home className="home-icon" />
									</div>
									<div style={{ fontSize: 10 }}>〉</div>
								</div>
								{pathsList.map((item, index) => {
									return (
										<div className="chain-hook">
											<div
												className="hook-name"
												onClick={() => {
													if (index !== pathsList.length - 1)
														setIsRouteDirectory(false);
													const newPathList = [
														...pathsList.slice(0, index + 1),
													];
													fetchByPath(newPathList, -1);
													setPathsList(newPathList);
												}}
											>
												{item}
											</div>
											{index < pathsList.length - 1 && (
												<div style={{ fontSize: 10 }}>〉</div>
											)}
										</div>
									);
								})}
							</div>
						) : (
							<div className="path-chain">
								<div className="chain-hook">
									<div
										className="hook-name"
										onClick={() => {
											setPathsList([]);
											fetchFoldersList();
										}}
									>
										<Home className="home-icon" />
									</div>
									<div style={{ fontSize: 10 }}>〉</div>
								</div>
								<div className="chain-hook">
									<div
										className="hook-name"
										onClick={() => {
											setIsModalOpen(true);
										}}
									>
										...
									</div>
									<div style={{ fontSize: 10 }}>〉</div>
								</div>
								<div></div>
								<div className="chain-hook">
									<div className="hook-name">
										{pathsList[pathsList.length - 1]}
									</div>
								</div>
							</div>
						)}
					</div>

					<div>
						<div
							className="tree-container"
							style={{
								overflowY: `${foldersLoading ? "hidden" : "auto"}`,
							}}
						>
							{!foldersNotFound ? (
								<div className="folders-list-container">
									{currentFoldersList.length ? (
										currentFoldersList?.map((item, index) => {
											return (
												<div
													onClick={() => {
														fetchByPath([...pathsList, item.name], index);
													}}
													className={`folder-card ${
														selectedIndex === index
															? "folder-without-child"
															: ""
													}`}
												>
													{item.name}
												</div>
											);
										})
									) : (
										<div className="no-folders-error">Empty !</div>
									)}
									{isLoadMoreEnabled && (
										<div className="load-more-button" onClick={loadMore}>
											Show More ↓
										</div>
									)}
								</div>
							) : (
								<div className="no-folders-error">
									No folders found. Click
									<span
										onClick={() => {
											openExternalURl(
												`https://console.pixelbin.io/choose-org?redirectTo=storage&${UTM_DETAILS}`
											);
										}}
									>
										Here
									</span>
									to create.
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="image-upload-form">
					<div className="tag-main-container">
						<div className="generic-text dropdown-label">Tags</div>
						<div className="dummy-file-input">
							<input
								className="tag-input-box"
								type="text"
								placeholder="add tags"
								onChange={(e) => {
									if (e.target.value.length < 14 && formValues.tags.length < 5)
										setCurrentTag(e.target.value);
								}}
								value={currentTag}
							/>
							<div
								className={`browse-btn ${
									currentTag.length > 0 || formValues.tags.length < 5
										? ""
										: "browse-btn-disabled"
								}`}
								onClick={() => {
									if (currentTag.length > 0 && formValues.tags.length < 5) {
										formValues.tags.push(currentTag);
										setCurrentTag("");
									}
								}}
							>
								Add&nbsp;+
							</div>
						</div>
						<div className="tag-sub-container">
							{formValues.tags.length
								? formValues.tags.map((item, index) => {
										return (
											<div className="tag-div">
												<>{item}</>
												<div
													onClick={() => {
														let temp = [...formValues.tags];
														temp.splice(index, 1);
														setFormValues({ ...formValues, tags: [...temp] });
													}}
												>
													<CloseIcon
														style={{
															height: 10,
															width: 10,
															cursor: "pointer",
														}}
													/>
												</div>
											</div>
										);
								  })
								: null}
						</div>
					</div>
				</div>
			</div>
			{isStorageLinkVisible ? (
				<div className="storage-link">
					Click&nbsp;
					<span
						onClick={() => {
							openExternalURl(
								`https://console.pixelbin.io/choose-org?redirectTo=storage&${UTM_DETAILS}`
							);
						}}
					>
						Here
					</span>
					&nbsp;to go to storage.
				</div>
			) : null}
			<div className={"api-key-btn-container space-between"}>
				<div className="details-text" style={{ fontSize: 12 }}>
					{Util.formatBytes(storageUsed || 0, 2)} of {`${totalStorage} GB used`}
				</div>

				<button
					id="submit-token"
					onClick={handleUpload}
					className="button button--primary"
					disabled={!imgUrl || (!pathsList.length && selectedIndex === -1)}
				>
					Upload
				</button>
			</div>
			{isModalOpen ? (
				<div ref={modalRef} className="list-modal">
					{pathsList?.map((item, index) => {
						return index < pathsList.length - 1 ? (
							<div
								onClick={() => {
									setIsRouteDirectory(false);
									const newPathList = [...pathsList.slice(0, index + 1)];
									fetchByPath(newPathList, -1);
									setPathsList(newPathList);
									setIsModalOpen(false);
								}}
								className="folder-card"
							>
								{item}
							</div>
						) : null;
					})}
				</div>
			) : null}
		</div>
	);
}

export default ImageUploader;
