import React, { useEffect, useRef, useState } from "react";
import "./style.scss";
import { ReactComponent as CloseIcon } from "../../../assets/close.svg";
import { PixelbinConfig, PixelbinClient } from "@pixelbin/admin";
import { PdkAxios } from "@pixelbin/admin/common.js";
import { uploadOptions } from "../../../constants";
import Pixelbin, { transformations } from "@pixelbin/core";
import { API_PIXELBIN_IO } from "../../../config";

interface IUProps {
	cloudName: string;
	tokenValue: string;
	isUploadSuccess: (msg: string) => void;
	setIsLoading: (val: boolean) => void;
}

function ImageUploader({
	cloudName,
	tokenValue,
	isUploadSuccess,
	setIsLoading,
}: IUProps) {
	let defaultPixelBinClient: PixelbinClient = new PixelbinClient(
		new PixelbinConfig({
			domain: `${API_PIXELBIN_IO}`,
			apiSecret: tokenValue,
		})
	);

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

	async function fetchFoldersList() {
		let data = await defaultPixelBinClient.assets.listFiles({
			onlyFolders: true,
			pageSize: 40,
		});

		console.log("Folders List", data);
	}

	async function handleUpload() {
		setIsLoading(true);

		// var pixelbin = new Pixelbin({
		// 	cloudName: cloudName,
		// 	zone: "default", // optional
		// });

		const regex = /\/([^\/]+)$/;

		let createSignedURlDetails = {
			path: "__figma/__pixelbin.io",
			name: formValues.imageName,
			format: formValues.image.type.match(regex)[1],
			access: "public-read",
			tags: [...formValues.tags],
			metadata: {},
			overwrite: formValues.overwrite,
			filenameOverride: formValues.filenameOverride,
		};

		console.log("formValues.image", createSignedURlDetails);
		let res = await defaultPixelBinClient.assets.createSignedUrlV2({
			...createSignedURlDetails,
			name: formValues.imageName,
		});

		Pixelbin.upload(formValues.image as any, res.presignedUrl, uploadOptions)
			.then(() => {
				console.log("UPload succesfull");
				isUploadSuccess(
					"Uploaded succesfully to storage in folder __figma/pixelbin"
				);
				setIsLoading(false);
			})
			.catch((err) => {
				isUploadSuccess(err);
				setIsLoading(false);
			});
	}

	useEffect(() => {
		fetchFoldersList();
	}, []);

	return (
		<div className="uploader-main-container">
			<div className="image-upload-form">
				<>
					<div className="generic-text dropdown-label">Select Image</div>
					<div className="dummy-file-input">
						<div className="img-name">
							{formValues.image !== null ? formValues.image?.name : ""}
						</div>
						<div
							className="browse-btn"
							onClick={() => inputRef.current?.click()}
						>
							Browse
						</div>
					</div>
					<input
						type="file"
						id="imageUpload"
						name="image"
						ref={inputRef}
						accept="image/*"
						style={{ display: "none" }}
						onChange={(event) => {
							const { files }: { files: FileList } = event.target;
							setFormValues({
								...formValues,
								image: files[0],
								imageName: files[0].name,
							});
						}}
						className="image-input"
					/>
				</>
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

				<div className="checkbox-container">
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
				</div>
				<div className="checkbox-container">
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
				</div>
			</div>
			<div
				className={`api-key-btn-container ${
					formValues.image !== null ? "space-between" : "right"
				}`}
			>
				{formValues.image !== null && (
					<div
						onClick={() => {
							setFormValues(staticFormValues);
						}}
						className="delete-token-container"
					>
						<div className="reset-text" style={{ fontSize: 12 }}>
							Reset All
						</div>
					</div>
				)}

				<button
					id="submit-token"
					onClick={handleUpload}
					className="button button--primary"
					disabled={formValues.image === null}
				>
					Upload
				</button>
			</div>
		</div>
	);
}

export default ImageUploader;
