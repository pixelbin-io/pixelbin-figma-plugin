import React, { useEffect, useState } from "react";
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
	const [searchedValue, setSearchedValue] = useState("");
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
	const [cursor, setCursor] = useState(false);
	const [imagesList, setImagesList] = useState([]);
	const [hasMoreImages, setHasMoreImages] = useState(false);
	const [imgApiInstance, setImgApiInstance] = useState(null);
	const [isFileAccOpen, setIsFileAccOpen] = useState(true);
	const [isFolderAccOpen, setIsFolderAccOpen] = useState(false);

	let defaultPixelBinClient: PixelbinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: API_PIXELBIN_IO,
			apiSecret: tokenValue,
		})
	);

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

	async function fetchImagesByPath(name) {
		try {
			setIsLoading(true);
			let temp = await defaultPixelBinClient.assets.listFilesPaginator({
				onlyFiles: true,
				path: name,
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

	useEffect(() => {
		fetchImagesByPath(selectedPath);
	}, [selectedPath]);

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
			setData({ ...data, children: items });
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
						{`Folders  (${data.children.length})`} &nbsp;
					</div>
					<div className={`${isFolderAccOpen ? "arrow-open" : ""}`}>
						&nbsp;▶
					</div>
				</div>
				<div className={`${!isFolderAccOpen ? "closed" : ""}`}>
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

						<div />
					</div>
					{isLoadMoreEnabled && (
						<div className="load-more-button" onClick={loadMore}>
							Load More ↓
						</div>
					)}
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
		</div>
	);
}

export default ImageDownloader;
