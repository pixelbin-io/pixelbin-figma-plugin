import {
	eraseBgOptions,
	EVENTS,
	COMMANDS,
	PERSISTED_TOKEN,
	SAVED_FORM_VALUE,
	IMAGE,
	CLOUD_NAME,
	ORG_ID,
} from "../constants";
import { HOW_IT_WORKS_URL } from "../config";

//Append the UI
figma.showUI(__html__, {
	title: "PixelBin.io",
	height: 505,
	width: 280,
	themeColors: true,
});

const {
	INITIAL_CALL,
	CREATE_FORM,
	TOGGLE_LOADER,
	IS_TOKEN_SAVED,
	SAVE_TOKEN,
	TRANSFORM,
	SELCTED_IMAGE,
	OPEN_EXTERNAL_URL,
	REPLACE_IMAGE,
	DELETE_TOKEN,
	ON_SELECTION_CHANGE,
	NOTIFY_USER,
	IS_TRANSFORMATION_APPLIED,
	TOKEN_SAVED,
	CREATE_NEW_IMAGE,
	CHANGE_TAB_ID,
	DISCARD_CHANGES,
} = EVENTS;

const { HOW_IT_WORKS_CMD, TOKEN_RESET_CMD, OPEN_PIXELBIN_CMD } = COMMANDS;

let savedWidth, saveHeight, savedHash;

if (figma.command === HOW_IT_WORKS_CMD) figma.openExternal(HOW_IT_WORKS_URL);

function toggleLoader(value: boolean) {
	figma.ui.postMessage({
		type: TOGGLE_LOADER,
		value,
	});
}

async function handleInitialSelection() {
	const body = {
		type: ON_SELECTION_CHANGE,
		imageBytes: null,
		imgName: "",
	};

	if (figma.currentPage.selection.length > 0) {
		figma.ui.postMessage({
			type: CHANGE_TAB_ID,
			tabId: 1,
		});

		var node: any = figma?.currentPage?.selection[0];
		if (node.fills && node.fills.length && node.fills[0].type === IMAGE) {
			const image = figma.getImageByHash(node.fills[0].imageHash);
			savedHash = node.fills[0].imageHash;
			saveHeight = node.height;
			savedWidth = node.width;
			let bytes = await image.getBytesAsync();
			body.imageBytes = bytes;
			body.imgName = node?.name?.replace(/ /g, "");
			figma.ui.postMessage(body);
			figma.ui.postMessage({ type: IS_TRANSFORMATION_APPLIED, value: false });
		}
	}
}

// Check if there is an initial selection when the plugin is launched
handleInitialSelection();

figma.on(ON_SELECTION_CHANGE, async () => {
	const body = {
		type: ON_SELECTION_CHANGE,
		imageBytes: null,
		imgName: "",
	};

	if (figma.currentPage.selection.length > 0) {
		figma.ui.postMessage({
			type: CHANGE_TAB_ID,
			tabId: 1,
		});
		var node: any = figma?.currentPage?.selection[0];
		if (node.fills && node.fills.length && node.fills[0].type === IMAGE) {
			const image = figma.getImageByHash(node.fills[0].imageHash);
			savedHash = node.fills[0].imageHash;
			saveHeight = node.height;
			savedWidth = node.width;
			let bytes = await image.getBytesAsync();
			body.imageBytes = bytes;
			body.imgName = node?.name?.replace(/ /g, "");
			figma.ui.postMessage({ type: IS_TRANSFORMATION_APPLIED, value: false });
		} else {
			body.imageBytes = null;
			figma.ui.postMessage({ type: IS_TRANSFORMATION_APPLIED, value: false });
		}
	} else {
		body.imageBytes = null;
		figma.ui.postMessage({ type: IS_TRANSFORMATION_APPLIED, value: false });
	}
	figma.ui.postMessage(body);
});

/* Handle the message from the UI */
figma.ui.onmessage = async (msg) => {
	var node: any = figma?.currentPage?.selection[0];
	var savedToken, savedCloudName, savedFormValue, orgId;
	if (msg.type === INITIAL_CALL) {
		const body = {
			type: CREATE_FORM,
			optionsArray: eraseBgOptions,
			savedFormValue: "",
			savedCloudName: "",
			orgId: "",
		};

		try {
			savedToken = await figma.clientStorage.getAsync(PERSISTED_TOKEN);
			savedCloudName = await figma.clientStorage.getAsync(CLOUD_NAME);
			savedFormValue = await figma.clientStorage.getAsync(SAVED_FORM_VALUE);
			orgId = await figma.clientStorage.getAsync(ORG_ID);

			if (savedToken !== undefined && savedToken !== null) {
				figma.ui.postMessage({
					type: IS_TOKEN_SAVED,
					value: true,
					isTokenEditing: figma.command === TOKEN_RESET_CMD,
					savedToken,
					savedCloudName,
					savedFormValue,
					orgId,
					command: figma.command,
				});
			} else {
				figma.ui.postMessage({
					type: IS_TOKEN_SAVED,
					value: false,
					savedFormValue: "",
					isTokenEditing: figma.command === TOKEN_RESET_CMD,
					command: figma.command,
				});
			}
		} catch (err) {
			figma.notify("Something went wrong");
		}
	}
	if (msg.type === SAVE_TOKEN) {
		figma.clientStorage
			.setAsync(PERSISTED_TOKEN, msg.value)
			.then(() => {
				figma.clientStorage
					.setAsync(CLOUD_NAME, msg.cloudName)
					.then(() => {})
					.catch(() => {});

				figma.clientStorage
					.setAsync(ORG_ID, msg.orgId)
					.then(() => {})
					.catch(() => {});

				const body = {
					type: TOKEN_SAVED,
					optionsArray: eraseBgOptions,
					savedFormValue: eraseBgOptions,
					cloudName: msg.cloudName,
					orgId: msg.orgId,
					command: OPEN_PIXELBIN_CMD,
				};

				figma.clientStorage
					.getAsync(SAVED_FORM_VALUE)
					.then((value) => {
						body.savedFormValue = value || eraseBgOptions;
						figma.ui.postMessage(body);
					})
					.catch((err) => {
						figma.ui.postMessage(body);
					});
			})
			.catch((err) => {
				console.error("Error saving token:", err);
			});
	}
	if (msg.type === DELETE_TOKEN) {
		await figma.clientStorage.deleteAsync(PERSISTED_TOKEN);
		await figma.clientStorage.deleteAsync(CLOUD_NAME);
		await figma.clientStorage.deleteAsync(ORG_ID);
	}

	if (msg.type === TRANSFORM) {
		if (msg.params) {
			figma.clientStorage
				.setAsync(SAVED_FORM_VALUE, msg.params)
				.then(() => {})
				.catch((err) => {
					console.error("Error saving data:", err);
				});
		}
		if (!figma.currentPage.selection.length) {
			figma.notify("Please select a image");
			return;
		}

		if (figma.currentPage.selection.length > 1) {
			figma.notify("Please select a single image");
			return;
		} else {
			node = figma.currentPage.selection[0];
			if (node.fills && node.fills.length && node.fills[0].type !== IMAGE) {
				figma.notify("Make sure you are selecting an image");
				return;
			}
			if (node.fills && node.fills.length && node.fills[0].type === IMAGE) {
				toggleLoader(true);
				const image = figma.getImageByHash(node.fills[0].imageHash);
				let bytes: any = null;
				let token = await figma.clientStorage.getAsync(PERSISTED_TOKEN);
				let savedCloudName = await figma.clientStorage.getAsync(CLOUD_NAME);
				let orgId = await figma.clientStorage.getAsync(ORG_ID);
				if (image) {
					bytes = await image.getBytesAsync();
					figma.ui.postMessage({
						type: SELCTED_IMAGE,
						imageBytes: bytes,
						imageName: node?.name?.replace(/ /g, ""),
						token,
						savedCloudName,
						orgId,
					});
				}
			} else {
				figma.notify("Make sure you are selecting an image");
				return;
			}
		}
	}
	if (msg.type === OPEN_EXTERNAL_URL) {
		figma.openExternal(msg.url);
	}
	if (msg.type === NOTIFY_USER) {
		figma.notify(msg.value);
	}
	if (msg.type === CREATE_NEW_IMAGE) {
		figma
			.createImageAsync(msg?.url)
			.then(async (image) => {
				const node = figma.createRectangle();
				const { width, height } = await image.getSizeAsync();
				node.resize(width, height);

				node.fills = [
					{
						type: "IMAGE",
						imageHash: image.hash,
						scaleMode: "FILL",
					},
				];

				figma.currentPage.selection = [node];
				const viewport = figma.viewport;
				if (!isRectangleVisibleInViewport(viewport, node)) {
					figma.viewport.scrollAndZoomIntoView([node]);
				}

				function isRectangleVisibleInViewport(viewport, rectangle) {
					const viewportRect = {
						x: viewport.bounds.x,
						y: viewport.bounds.y,
						width: viewport.bounds.width,
						height: viewport.bounds.height,
					};
					const rectangleRect = {
						x: rectangle.x,
						y: rectangle.y,
						width: rectangle.width,
						height: rectangle.height,
					};
					return (
						viewportRect.x <= rectangleRect.x &&
						viewportRect.y <= rectangleRect.y &&
						viewportRect.x + viewportRect.width >=
							rectangleRect.x + rectangleRect.width &&
						viewportRect.y + viewportRect.height >=
							rectangleRect.y + rectangleRect.height
					);
				}
			})
			.catch((err) => {
				figma.notify("Something went wrong");
			});
	}

	if (msg.type === DISCARD_CHANGES) {
		node.resize(savedWidth, saveHeight);
		node.fills = [
			{
				type: IMAGE,
				imageHash: savedHash,
				scaleMode: "FILL",
			},
		];
		toggleLoader(false);
		figma.notify("Changes discarded", { timeout: 2000 });
	}

	if (msg.type === REPLACE_IMAGE) {
		let status,
			retries = 5;

		async function getStatus() {
			let statusData;
			toggleLoader(true);
			let data = await fetch(msg?.transformedUrl);
			statusData = data;
			status = data?.status;
			if (data?.status === 202 && retries > 0) {
				setTimeout(() => {
					retries = retries - 1;
					getStatus();
				}, 5000);
				return;
			} else {
				toggleLoader(false);
			}

			if (status === 200) {
				toggleLoader(true);
				figma
					.createImageAsync(msg?.transformedUrl)
					.then(async (image) => {
						const { width, height } = await image.getSizeAsync();
						node.resize(width, height);
						node.fills = [
							{
								type: IMAGE,
								imageHash: image.hash,
								scaleMode: "FILL",
							},
						];
						toggleLoader(false);
						figma.notify(
							"Transformation Applied. You can use Ctrl/Cmd + Z to undo transformations",
							{ timeout: 5000 }
						);
						figma.ui.postMessage({
							type: IS_TRANSFORMATION_APPLIED,
							value: true,
							url: msg?.transformedUrl,
						});
					})
					.catch((err) => {
						toggleLoader(false);
						figma.notify("Something went wrong");
					});
			} else {
				statusData?.url?.includes("shadow.gen") && statusData?.status === 404
					? figma.notify(
							"The image must contain full human to generate the shadow",
							{ timeout: 5000 }
					  )
					: figma.notify("Something went wrong");
				toggleLoader(false);
			}
		}
		getStatus();
	}
};
