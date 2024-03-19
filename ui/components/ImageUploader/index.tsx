import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import { uploadOptions, EVENTS } from "../../../constants";
import Pixelbin from "@pixelbin/core";
import { API_PIXELBIN_IO } from "../../../config";
import { Util } from "../../../util";
import { v4 as uuidv4 } from "uuid";
import { ReactComponent as Home } from "../../../assets/home.svg";

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
			const newData = await defaultPixelBinClient.billing.getUsage();
			setStorageUSed(newData?.usage?.storage);
			setTotalStorage(newData?.total.storage);
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
		}
	}

	async function fetchFoldersList() {
		try {
			setIsLoading(true);
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
		try {
			setIsLoading(true);
			const { items, page } = await apiInstance.next();
			let temp = [
				...currentFoldersList,
				...(isRouteDirectory
					? items.filter((item, index) => item.path === "")
					: items),
			];
			setCurrrentFoldersList([...temp]);
			setIsLoadMoreEnabled(apiInstance.hasNext());
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function fetchByPath(list) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: list.join("/"),
			});
			setAPIInstance(temp);
			const { items, page } = await temp.next();
			setIsLoadMoreEnabled(temp.hasNext());
			setCurrrentFoldersList([...items]);
			setIsLoading(false);
			return items;
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function handleUpload() {
		try {
			setIsLoading(true);

			const regex = /\/([^\/]+)$/;

			let createSignedURlDetails = {
				path: pathsList.join("/"),
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
					isUploadSuccess("Uploaded succesfully");
					setIsLoading(false);
					setStorageDetails();
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
												const newPathList = [...pathsList.slice(0, index + 1)];
												fetchByPath(newPathList);
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
					<div className="tree-container">
						{!foldersNotFound ? (
							<div className="folders-list-container">
								{currentFoldersList.length ? (
									currentFoldersList?.map((item, index) => {
										return (
											<div
												onClick={() => {
													setIsRouteDirectory(false);
													fetchByPath([...pathsList, item.name]);
													setPathsList([...pathsList, item.name]);
												}}
												className="folder-card"
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
											"https://console.pixelbin.io/choose-org?redirectTo=storage"
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
			<div className={"api-key-btn-container space-between"}>
				<div className="details-text" style={{ fontSize: 12 }}>
					{Util.formatBytes(storageUsed || 0, 2)} of {`${totalStorage} GB used`}
				</div>

				<button
					id="submit-token"
					onClick={handleUpload}
					className="button button--primary"
					disabled={!imgUrl || !pathsList.length}
				>
					Upload
				</button>
			</div>
			{isModalOpen ? (
				<div ref={modalRef} className="list-modal">
					{pathsList?.map((item, index) => {
						return index > 0 && index < pathsList.length - 1 ? (
							<div
								onClick={() => {
									setIsRouteDirectory(false);
									const newPathList = [...pathsList.slice(0, index + 1)];
									fetchByPath(newPathList);
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
