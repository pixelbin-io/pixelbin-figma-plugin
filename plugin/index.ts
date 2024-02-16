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
	height: 460,
	width: 280,
	themeColors: true,
});

const rectangles: RectangleNode[] = [];
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
	CLOSE_PLUGIN,
	CURRENT_IMAGE_SELECTION,
	ON_SELECTION_CHANGE,
} = EVENTS;

const { HOW_IT_WORKS_CMD, TOKEN_RESET_CMD } = COMMANDS;

if (figma.command === HOW_IT_WORKS_CMD) figma.openExternal(HOW_IT_WORKS_URL);

function toggleLoader(value: boolean) {
	figma.ui.postMessage({
		type: TOGGLE_LOADER,
		value,
	});
}

figma.on(ON_SELECTION_CHANGE, async () => {
	const body = {
		type: ON_SELECTION_CHANGE,
		imageBytes: null,
	};

	if (figma.currentPage.selection.length > 0) {
		var node: any = figma?.currentPage?.selection[0];
		if (node.fills && node.fills.length && node.fills[0].type === IMAGE) {
			const image = figma.getImageByHash(node.fills[0].imageHash);
			let bytes = await image.getBytesAsync();
			body.imageBytes = bytes;
		} else body.imageBytes = null;
	} else body.imageBytes = null;
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
				});
			} else {
				figma.ui.postMessage({
					type: IS_TOKEN_SAVED,
					value: false,
					savedFormValue: "",
					isTokenEditing: figma.command === TOKEN_RESET_CMD,
				});
			}
		} catch (err) {
			figma.notify("Something wnet wrong");
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
					type: CREATE_FORM,
					optionsArray: eraseBgOptions,
					savedFormValue: eraseBgOptions,
					cloudName: msg.cloudName,
					orgId: msg.orgId,
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
				.then(() => {
					console.log("Data Saved", msg.params);
				})
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
	if (msg.type === REPLACE_IMAGE) {
		figma
			.createImageAsync(msg?.bgRemovedUrl)
			.then(async (image: Image) => {
				node.fills = [
					{
						type: IMAGE,
						imageHash: image.hash,
						scaleMode: "FILL",
					},
				];
				toggleLoader(false);
				figma.notify("Transformation Applied ", { timeout: 5000 });
			})
			.catch((err) => {
				figma.notify("Something went wrong");
				console.log("HEY GET YOUR AWAITED ERROR HERE", err);
			});
	} else if (msg.type === CLOSE_PLUGIN) figma.closePlugin();
};
