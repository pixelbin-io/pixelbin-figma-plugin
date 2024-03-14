import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import { PdkAxios } from "@pixelbin/admin/common.js";
import { uploadOptions, EVENTS } from "../../../constants";
import Pixelbin, { transformations } from "@pixelbin/core";
import { API_PIXELBIN_IO } from "../../../config";
import { Treebeard } from "react-treebeard";
import { Util } from "../../../util";
import { v4 as uuidv4 } from "uuid";

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

	const staticFormValues = {
		image: null,
		imageName: "",
		filenameOverride: true,
		overwrite: false,
		tags: [],
	};
	const inputRef = useRef(null);
	const [formValues, setFormValues] = useState(staticFormValues);
	const [currentTag, setCurrentTag] = useState("");
	const [cursor, setCursor] = useState(false);
	const [data, setData] = useState({
		name: "root",
		toggled: true,
		path: "root",
		children: [],
	});
	const [selectedPath, setSelectedPath] = useState("");
	const [isLoadMoreEnabled, setIsLoadMoreEnabled] = useState(false);
	const [apiInstance, setAPIInstance] = useState(null);
	const [foldersNotFound, setFolderNotFound] = useState(true);
	const [storageUsed, setStorageUSed] = useState(0);
	const [totalStorage, setTotalStorage] = useState(0);
	const [isAccOpen, setIsAccOpen] = useState(true);

	function deactivateChildren(node) {
		let temp = node;
		if (temp.children && node.children.length > 0) {
			node.children.forEach((child) => {
				child.active = false;
				deactivateChildren(child);
			});
		}
	}

	const formatDigits = (value) => {
		const trimmed = parseFloat(parseFloat(value).toFixed(3));
		if (Math.floor(trimmed) === trimmed) return Math.floor(trimmed);
		return trimmed;
	};

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
			});
			setAPIInstance(temp);
			const { items, page } = await temp.next();
			setIsLoadMoreEnabled(temp.hasNext());

			let x = data;
			x.children = items
				.filter((item, index) => item.path === "")
				.map((item, index) => {
					return { ...item, children: [] };
				});
			setData({ ...x });
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
			let temp1 = data;
			temp1.children = [
				...data.children,
				...items
					.filter((item, index) => item.path === "")
					.map((item, index) => {
						return { ...item, children: [] };
					}),
			];
			setData({ ...temp1 });
			setIsLoadMoreEnabled(apiInstance.hasNext());
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function fetchByName(name) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				path: name,
			});
			const { items, page } = await temp.next();
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
				path: selectedPath,
				name: uuidv4(),
				access: "public-read",
				tags: [...formValues.tags],
				metadata: {},
				overwrite: formValues.overwrite,
				filenameOverride: formValues.filenameOverride,
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

	const onToggle = async (node, toggled) => {
		try {
			setIsLoading(true);
			if (cursor) {
				setCursor(false);
			}
			if (node.path === "root") {
				fetchFoldersList();
				deactivateChildren(data);
				setSelectedPath("");
			}
			if (node.path !== "root") {
				let pathname = node.path.length
					? `${node.path}/${node.name}`
					: node.name;
				let x = await fetchByName(pathname);
				x = [
					...x.map((item, index) => {
						return { ...item, children: [] };
					}),
				];
				node.children = x;
				deactivateChildren(data);
				node.active = true;
				setSelectedPath(pathname);
			}

			node.toggled = toggled;
			setCursor(node);
			setData(Object.assign({}, data));
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	};

	return (
		<div className="uploader-main-container">
			<div className="uploader-form-container">
				{/* <div className="generic-text dropdown-label">
					Select folder to upload image *
				</div> */}
				<div
					onClick={() => setIsAccOpen(!isAccOpen)}
					className="accordion generic-text dropdown-label"
					style={{ marginTop: 8 }}
				>
					<div>Select Folder* &nbsp;</div>
					<span className={`${isAccOpen ? "arrow-open" : ""}`}>&nbsp;▶</span>
				</div>
				{isAccOpen ? (
					<div>
						<div className="tree-container">
							{!foldersNotFound ? (
								<Treebeard data={data} onToggle={onToggle} />
							) : (
								<div className="no-folders-error">
									No folders found. Click{" "}
									<span
										onClick={() => {
											openExternalURl(
												"https://console.pixelbin.io/choose-org?redirectTo=storage"
											);
										}}
									>
										Here
									</span>{" "}
									to create.
								</div>
							)}
						</div>
						{isLoadMoreEnabled && (
							<div className="load-more-button" onClick={loadMore}>
								Load More ↓
							</div>
						)}
					</div>
				) : null}

				<div style={{ marginTop: 12 }}>
					<div
						className="generic-text dropdown-label"
						style={{ color: "#9da5ab" }}
					>
						Selected folder's path
					</div>
					<div className="path-string">
						{selectedPath || <span>path will be shown here ...</span>}
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
					{/* <div className="checkbox-container">
						<input
							id="overwrite-sb"
							type="checkbox"
							checked={formValues.overwrite}
							onChange={(e) => {
								setFormValues({
									...formValues,
									overwrite: e.target.checked,
								});
							}}
						/>
						<div className="generic-text">Overwrite</div>
					</div> */}
					{/* <div className="checkbox-container">
						<input
							id="overwrite-sb"
							type="checkbox"
							checked={formValues.filenameOverride}
							onChange={(e) => {
								setFormValues({
									...formValues,
									filenameOverride: e.target.checked,
								});
							}}
						/>
						<div className="generic-text">Filename Override</div>
					</div> */}
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
					disabled={!imgUrl || !selectedPath.length}
				>
					Upload
				</button>
			</div>
		</div>
	);
}

export default ImageUploader;
