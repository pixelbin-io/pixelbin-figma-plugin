export const eraseBgOptions = [
	{
		name: "Industry Type",
		type: "enum",
		enum: ["general", "ecommerce", "car", "human"],
		preview: ["car"],
		default: "general",
		identifier: "i",
		title: "Industry type",
	},
	{
		name: "Add Shadow",
		title: "Add Shadow (cars only)",
		type: "boolean",
		default: false,
		preview: false,
		identifier: "shadow",
	},
	{
		name: "Refine",
		title: "Refine Output",
		type: "boolean",
		default: true,
		identifier: "r",
	},
	{
		name: "seed",
		type: "integer",
		default: 123,
		min: 1,
		max: 1000,
		identifier: "s",
		title: "Seed",
	},
];

//Events are used to pass event/messages/data from UI to Plugin or vice versa
export enum EVENTS {
	TOGGLE_LOADER = "toggle-loader",
	INITIAL_CALL = "initial-call",
	CREATE_FORM = "create-form",
	TRANSFORM = "transform",
	REPLACE_IMAGE = "replace-image",
	SELCTED_IMAGE = "selected-image",
	SAVE_TOKEN = "save-token",
	IS_TOKEN_SAVED = "is-token-saved",
	OPEN_EXTERNAL_URL = "open-external-url",
	DELETE_TOKEN = "delete-token",
	CLOSE_PLUGIN = "close-plugin",
	CURRENT_IMAGE_SELECTION = "current-image-selection",
	ON_SELECTION_CHANGE = "selectionchange",
	NOTIFY_USER = "notify-user",
	TOKEN_SAVED = "tokenSaved",
	CREATE_NEW_IMAGE = "createNewImage",
	IS_TRANSFORMATION_APPLIED = "is-transformation-applied",
	CHANGE_TAB_ID = "change-tab-id",
	DISCARD_CHANGES = "discard-changes",
}

// This set is used for which tab is currently active (used as a plain string in manifest.json)
export enum COMMANDS {
	HOW_IT_WORKS_CMD = "how-it-works-command",
	TOKEN_RESET_CMD = "token-reset-command",
	UPLOAD_CMD = "upload-command",
	DOWNLOAD_CMD = "download-command",
	OPEN_PIXELBIN_CMD = "open-pixelbin-command",
}

// This set is used to keep values in local storage
export const PERSISTED_TOKEN = "persistedToken";
export const SAVED_FORM_VALUE = "savedFormValue";
export const IMAGE = "IMAGE";
export const CLOUD_NAME = "cloudName";
export const ORG_ID = "organisationId";
export const UTM_DETAILS =
	"?utm_source=figma&utm_medium=plugin&utm_campaign=pixelbinio";

export const createSignedURlDetails = {
	path: "__figma/__pixelbin.io",
	format: "jpeg",
	access: "public-read",
	tags: ["tag1", "tag2"],
	metadata: {},
	overwrite: false,
	filenameOverride: false,
};

export const uploadOptions = {
	chunkSize: 2 * 1024 * 1024,
	maxRetries: 1,
	concurrency: 2,
};

export const modIconList = [
	"blur",
	"compress",
	"extend",
	"flip",
	"flop",
	"resize",
	"sharpen",
];
