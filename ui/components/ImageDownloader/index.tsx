import React, { useEffect, useState, useRef } from "react";
import "./style.scss";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import { EVENTS } from "../../../constants";
import { API_PIXELBIN_IO } from "../../../config";
import { Treebeard } from "react-treebeard";
import SearchBox from "../SearchBox";
import { ReactComponent as Download } from "../../../assets/download.svg";

interface downloadProps {
	setIsLoading: (val: boolean) => void;
	tokenValue: string;
	showErrMessage: () => void;
}

const { OPEN_EXTERNAL_URL, CREATE_NEW_IMAGE } = EVENTS;

function ImageDownloader({
	setIsLoading,
	tokenValue,
	showErrMessage,
}: downloadProps) {
	const ref = useRef(null);

	const [searchedValue, setSearchedValue] = useState("");
	const [data, setData] = useState({
		name: "root",
		toggled: true,
		path: "root",
		children: [],
	});
	const [isLoadMoreEnabled, setIsLoadMoreEnabled] = useState(false);
	const [apiInstance, setAPIInstance] = useState(null);
	const [foldersNotFound, setFolderNotFound] = useState(true);
	const [imagesList, setImagesList] = useState([]);
	const [hasMoreImages, setHasMoreImages] = useState(false);
	const [imgApiInstance, setImgApiInstance] = useState(null);
	const [isFileAccOpen, setIsFileAccOpen] = useState(true);
	const [isFolderAccOpen, setIsFolderAccOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [currentFoldersList, setCurrrentFoldersList] = useState([]);
	const [pathsList, setPathsList] = useState([]);
	const [isRouteDirectory, setIsRouteDirectory] = useState(true);

	let defaultPixelBinClient: PixelbinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: API_PIXELBIN_IO,
			apiSecret: tokenValue,
		})
	);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (ref.current && !ref.current.contains(event.target)) {
				setIsModalOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	function deactivateChildren(node) {
		let temp = node;
		if (temp.children && node.children.length > 0) {
			node.children.forEach((child) => {
				child.active = false;
				deactivateChildren(child);
			});
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

	async function fetchImagesByPath(list) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFiles: true,
				path: list.join("/"),
			});
			const { items, page } = await temp.next();
			setIsLoading(false);
			setImgApiInstance(temp);
			setHasMoreImages(temp.hasNext());
			setImagesList([...items]);
			return items;
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function searchFolder(val) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFolders: true,
				name: val,
			});
			const { items, page } = await temp.next();
			setAPIInstance(temp);
			setIsLoadMoreEnabled(temp.hasNext());
			setCurrrentFoldersList([...items]);
			setIsLoading(false);
			return items;
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function fetchImageList() {
		setIsLoading(true);
		let temp = await defaultPixelBinClient.assets.listFilesPaginator({
			onlyFiles: true,
		});
		setImgApiInstance(temp);
		const { items, page } = await temp.next();
		setImagesList([...imagesList, ...items]);
		setHasMoreImages(temp.hasNext());
	}

	async function searchImages(val) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFiles: true,
				name: val,
			});
			const { items, page } = await temp.next();
			setIsLoading(false);
			setImgApiInstance(temp);
			setHasMoreImages(temp.hasNext());
			setImagesList([...items]);
			return items;
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

	async function loadMoreImages() {
		try {
			setIsLoading(true);
			const { items, page } = await imgApiInstance.next();
			setImagesList([...imagesList, ...items]);
			setHasMoreImages(imgApiInstance.hasNext());
			setIsLoading(false);
		} catch (err) {
			setIsLoading(false);
			showErrMessage();
		}
	}

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

	useEffect(() => {
		fetchFoldersList();
		fetchImageList();
	}, []);

	useEffect(() => {
		setPathsList([]);
	}, [searchedValue]);

	return (
		<div className="img-dwnld-main">
			<div className="sticky-search-box">
				<SearchBox
					setValue={(val) => {
						setSearchedValue(val);
						searchFolder(val);
						searchImages(val);
					}}
					placeHolder="Search Folders/Files..."
				/>
			</div>

			<div className="img-dwnld-sub">
				<div
					onClick={() => setIsFolderAccOpen(!isFolderAccOpen)}
					className="accordion"
				>
					<div className="accordion-name">
						{`Folders  (${currentFoldersList.length})`} &nbsp;
					</div>
					<div className={`${isFolderAccOpen ? "arrow-open" : ""}`}>
						&nbsp;▶
					</div>
				</div>
				<div className={`${!isFolderAccOpen ? "closed" : ""}`}>
					<div>
						{pathsList.length < 3 ? (
							<div className="path-chain">
								<div className="chain-hook">
									<div
										className="hook-name"
										onClick={() => {
											setPathsList([]);
											fetchFoldersList();
											fetchImagesByPath([]);
											setSearchedValue("");
										}}
									>
										My Library
									</div>
									{pathsList.length ? (
										<div style={{ fontSize: 10 }}>〉</div>
									) : null}
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
											fetchImagesByPath([]);
											setSearchedValue("");
										}}
									>
										My Library
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
													fetchImagesByPath([...pathsList, item.name]);
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
										Load More ↓
									</div>
								)}
							</div>
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

						<div />
					</div>
				</div>
				<div
					onClick={() => setIsFileAccOpen(!isFileAccOpen)}
					className="accordion"
					style={{ marginTop: 8 }}
				>
					<div className="accordion-name">
						{`Files (${imagesList.length})`}&nbsp;
					</div>
					<div className={`${isFileAccOpen ? "arrow-open" : ""}`}>&nbsp;▶</div>
				</div>
				<div className={`${!isFileAccOpen ? "closed" : ""}`}>
					<div>
						{imagesList.length ? (
							<div className="image-list-container">
								{imagesList.map((item, index) => (
									<div style={{ position: "relative" }}>
										<img src={item.url} className="img-list-img" alt="Image" />
										<div
											className="download-icon"
											onClick={() => {
												parent.postMessage(
													{
														pluginMessage: {
															type: CREATE_NEW_IMAGE,
															url: item.url,
														},
													},
													"*"
												);
											}}
										>
											↓
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="no-imgs">No images at this path !</div>
						)}
					</div>
					{hasMoreImages && (
						<div className="load-more-button" onClick={loadMoreImages}>
							Load More ↓
						</div>
					)}
				</div>
			</div>
			{isModalOpen ? (
				<div ref={ref} className="list-modal">
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

export default ImageDownloader;
