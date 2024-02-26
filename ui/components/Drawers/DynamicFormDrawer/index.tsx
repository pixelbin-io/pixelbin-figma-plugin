import React, { useEffect, useState, useRef } from "react";
import { Util } from "../../../../util";
import { ReactComponent as CloseIcon } from "../../../../assets/close.svg";
import Footer from "../../Footer";
import Divider from "../../Divider";
import { eraseBgOptions } from "../../../../constants";
import { ReactComponent as WaterdropSLash } from "../../../../assets/Water-drop-slash.svg";
import ReactCrop, { type Crop } from "react-image-crop";
import "./style.scss";
import SingleBoxCropper from "./SingleBoxCropper";
import MultiBoxCropper from "./MultiBoxCropper";

declare const Object: {
	entries: <T>(o: T) => [keyof T, T[keyof T]][];
};

interface formProps {
	toggler: () => void;
	operation: any;
	url: any;
	onTransformationApply: (data: any) => void;
	selectedValues: any | null;
	index: number | null;
}

function DynamicFormDrawer({
	toggler,
	operation,
	url,
	onTransformationApply,
	selectedValues = null,
}: formProps) {
	const inputRef = useRef(null);
	const colorRef = useRef(null);
	const [formValues, setFormValues] = useState([]);
	const [isCropperOpen, setIsCropperOpen] = useState(false);
	const [bboxCoordinates, setBboxCoordinates] = useState({
		top: 10,
		left: 10,
		height: 0,
		width: 0,
	});
	const [isMultiboxCropperOpen, setIsMultiboxCropperOpen] = useState(false);
	const [bBoxList, setbBoxList] = useState("");

	function formSetter() {
		let temp = { ...formValues };
		operation.params.forEach((option, index) => {
			const camelCaseName = Util.camelCase(option.name);
			temp[camelCaseName] = option.default;
		});

		if (selectedValues !== null) {
			temp = { ...selectedValues.selectedFormValues };
		}

		setFormValues({ ...temp });
	}

	useEffect(() => {
		formSetter();
	}, [operation]);

	function cropToggler() {
		setIsCropperOpen(!isCropperOpen);
	}
	function multiBoxCropperToggler() {
		setIsMultiboxCropperOpen(!isMultiboxCropperOpen);
	}

	function setBboxValues(obj: any) {
		setBboxCoordinates({ ...obj });
		let temp = {
			top: obj.top,
			left: obj.left,
			height: obj.height,
			width: obj.width,
		};
		setFormValues({ ...formValues, ...temp });
	}

	function setbBoxListVaLues(arr: any) {
		setbBoxList(arr);
		let temp = {
			...formValues,
			listOfBboxes: Util.stringifyBBoxList(arr),
		};
		setFormValues({ ...temp });
	}

	function submitForm() {
		let data = { selectedFormValues: formValues, op: operation };
		onTransformationApply(data);
	}

	return (
		<div className="dfd-container">
			<Divider />
			<div className="header">
				<div className="name">{operation.displayName}</div>
				<CloseIcon className="close-icon" onClick={toggler} />
			</div>
			<Divider />

			<div className="form-container">
				{operation.params.map((obj, index) => {
					switch (obj.type) {
						case "enum":
							return (
								<>
									<div className="generic-text dropdown-label">{obj.title}</div>
									<div className="select-wrapper">
										<select
											onChange={(e) => {
												setFormValues({
													...formValues,
													[Util.camelCase(obj.name)]: e.target.value,
												});
											}}
											id={Util.camelCase(obj.name)}
											value={formValues[Util.camelCase(obj.name)]}
										>
											{obj.enum.map((option, index) => (
												<option key={index} value={option}>
													{option}
												</option>
											))}
										</select>
									</div>
								</>
							);
						case "color":
							return (
								<div>
									<div className="generic-text dropdown-label">{obj.title}</div>
									<div
										className="color-picker-input"
										onClick={() => colorRef.current?.click()}
									>
										<div className="generic-text dropdown-label">
											Select Color
										</div>
										<div className="color-pciker-div">
											{formValues[Util.camelCase(obj.name)] === "00000000" ? (
												<WaterdropSLash className="picker-icon" />
											) : (
												<div
													className="color-box"
													style={{
														background: `#${
															formValues[Util.camelCase(obj.name)]
														}`,
													}}
												></div>
											)}
										</div>
										<input
											type="color"
											id="colorPicker"
											name="colorPicker"
											ref={colorRef}
											value={formValues[Util.camelCase(obj.name)]}
											onChange={(e) => {
												setFormValues({
													...formValues,
													[Util.camelCase(obj.name)]: e.target.value.replace(
														"#",
														""
													),
												});
											}}
											style={{ display: "none" }}
										/>
									</div>
								</div>
							);
						case "boolean":
							return (
								<div className="checkbox-container">
									<input
										id={Util.camelCase(obj.name)}
										type="checkbox"
										checked={formValues[Util.camelCase(obj.name)]}
										onChange={(e) => {
											setFormValues({
												...formValues,
												[Util.camelCase(obj.name)]: e.target.checked,
											});
										}}
									/>
									<div className="generic-text">{obj.title}</div>
								</div>
							);
						case "file":
							return (
								<>
									<div className="generic-text dropdown-label">{obj.title}</div>
									<div
										className="dummy-file-input"
										onClick={() => inputRef.current?.click()}
									>
										{formValues[Util.camelCase(obj.name)]
											? formValues[Util.camelCase(obj.name)]?.name
											: "Browse Image"}
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
												[Util.camelCase(obj.name)]: files[0],
											});
										}}
										className="image-input"
									/>
								</>
							);
						case "bbox":
							return (
								<div className="bbox">
									<div className="values">
										{bboxCoordinates.height === 0
											? null
											: `${bboxCoordinates.top}_${bboxCoordinates.left}_${bboxCoordinates.height}_${bboxCoordinates.width}`}
									</div>
									<div onClick={cropToggler} className="draw-btn">
										Draw
									</div>
								</div>
							);
						case "bboxList":
							return (
								<div className="bbox">
									<div className="values">
										{bBoxList.length ? Util.stringifyBBoxList(bBoxList) : null}
									</div>
									<div onClick={multiBoxCropperToggler} className="draw-btn">
										Draw
									</div>
								</div>
							);
						case "custom":
						case "string":
						case "polygonList":
							return (
								<div className="text-box-container">
									<div className="generic-text dropdown-label">{obj.title}</div>
									<input
										className="text-input-box"
										id={Util.camelCase(obj.name)}
										type="text"
										value={formValues[Util.camelCase(obj.name)]}
										onChange={(e) => {
											setFormValues({
												...formValues,
												[Util.camelCase(obj.name)]: e.target.value,
											});
										}}
									/>
								</div>
							);
						case "integer":
						case "float":
							return operation.displayName.toLowerCase() !== "extract" ? (
								<div className="slider-container">
									<div className="generic-text dropdown-label">{obj.title}</div>
									<div className="slider-sub-container">
										<div className="slider-div">
											<div className="slider-values-container">
												<div>{obj.min}</div>
												<div>{obj.max}</div>
											</div>
											<input
												type="range"
												min={obj.min}
												max={obj.max}
												step={obj.type === "integer" ? 1 : 0.1}
												onChange={(e) => {
													setFormValues({
														...formValues,
														[Util.camelCase(obj.name)]: e.target.value,
													});
												}}
												value={formValues[Util.camelCase(obj.name)]}
											/>
										</div>
										<input
											className="slider-text-input"
											type="text"
											value={formValues[Util.camelCase(obj.name)]}
											onChange={(e) => {
												setFormValues({
													...formValues,
													[Util.camelCase(obj.name)]: e.target.value,
												});
											}}
										/>
									</div>
								</div>
							) : null;
						default:
							return null;
					}
				})}
			</div>
			<Divider />
			<Footer handleReset={() => {}} handleSubmit={submitForm} />
			{isCropperOpen && (
				<SingleBoxCropper
					setCordinates={setBboxValues}
					toggler={cropToggler}
					url={url}
				/>
			)}
			{isMultiboxCropperOpen && (
				<MultiBoxCropper
					url={url}
					toggler={multiBoxCropperToggler}
					setBoxList={setbBoxListVaLues}
				/>
			)}
		</div>
	);
}

export default DynamicFormDrawer;
