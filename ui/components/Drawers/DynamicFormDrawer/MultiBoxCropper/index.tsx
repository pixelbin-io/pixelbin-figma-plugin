import React, { useEffect, useRef, useState } from "react";
import Divider from "../../../Divider";
import { ReactComponent as CloseIcon } from "../../../../../assets/close.svg";
import "./style.scss";

interface BoxProps {
	url: string;
	toggler: () => void;
	setBoxList: (arr: any) => void;
}

function MultiBoxCropper({ url, toggler, setBoxList }: BoxProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [boxes, setBoxes] = useState<
		{ top: number; left: number; width: number; height: number }[]
	>([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [isAddButtonDisabled, setIsAddButtonDisabled] = useState(true);

	useEffect(() => {
		setIsAddButtonDisabled(boxes.length === 0);
	}, [boxes]);

	const image = new Image();
	image.src = url;

	useEffect(() => {
		const canvas = canvasRef.current;

		if (canvas) {
			const ctx = canvas.getContext("2d");

			if (ctx) {
				image.onload = () => {
					const aspectRatio = image.width / image.height;

					let canvasWidth = 250;
					let canvasHeight = 250 / aspectRatio;

					if (canvasHeight > 250) {
						canvasHeight = 250;
						canvasWidth = 250 * aspectRatio;
					}

					canvas.width = canvasWidth;
					canvas.height = canvasHeight;

					ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
					if (boxes.length > 0) {
						boxes.forEach((box, index) => drawBox(ctx, box, index));
					}
				};

				canvas.addEventListener("mousedown", handleMouseDown);
				canvas.addEventListener("mouseup", handleMouseUp);
				canvas.addEventListener("mousemove", handleMouseMove);

				return () => {
					canvas.removeEventListener("mousedown", handleMouseDown);
					canvas.removeEventListener("mouseup", handleMouseUp);
					canvas.removeEventListener("mousemove", handleMouseMove);
				};
			}
		}
	}, [url, boxes]);

	const drawBox = (
		ctx: CanvasRenderingContext2D,
		currentBox: {
			top: number;
			left: number;
			width: number;
			height: number;
		},
		index: number
	) => {
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.setLineDash([5, 5]); // Set line dash pattern
		ctx.strokeRect(
			Math.round((currentBox.left / image.width) * ctx.canvas.width),
			Math.round((currentBox.top / image.height) * ctx.canvas.height),
			Math.round((currentBox.width / image.width) * ctx.canvas.width),
			Math.round((currentBox.height / image.height) * ctx.canvas.height)
		);

		// Add x icon at the top right of each box
		// const xIconSize = 15;
		// const xIconTop = currentBox.top - 7;
		// const xIconLeft = currentBox.left + currentBox.width - xIconSize + 5;

		// ctx.fillStyle = "white";
		// ctx.fillRect(xIconLeft, xIconTop, xIconSize, xIconSize);

		// ctx.fillStyle = "black";
		// ctx.fillText("✕", xIconLeft + 4, xIconTop + 12);

		// Add click event for removing the box
		//
	};

	const handleMouseDown = (e: MouseEvent) => {
		const canvas = canvasRef.current;
		if (canvas) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			const originalLeft = Math.round((mouseX / canvas.width) * image.width);
			const originalTop = Math.round((mouseY / canvas.height) * image.height);
			if (boxes.length < 4) {
				setBoxes((prevBoxes) => [
					...prevBoxes,
					{ top: originalTop, left: originalLeft, width: 0, height: 0 },
				]);
				setIsDrawing(true);
			}
		}
	};

	const handleMouseUp = () => {
		setIsDrawing(false);
	};

	const handleMouseMove = (e: MouseEvent) => {
		const canvas = canvasRef.current;
		if (canvas && isDrawing) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			setBoxes((prevBoxes) => {
				const lastBox = prevBoxes[prevBoxes.length - 1];
				prevBoxes[prevBoxes.length - 1];
				const originalWidth = Math.round(
					(mouseX / canvas.width) * image.width -
						prevBoxes[prevBoxes.length - 1].left
				);
				const originalHeight = Math.round(
					(mouseY / canvas.height) * image.height -
						prevBoxes[prevBoxes.length - 1].top
				);
				return [
					...prevBoxes.slice(0, -1),
					{
						...lastBox,
						width: originalWidth,
						height: originalHeight,
					},
				];
			});
		}
	};

	useEffect(() => {
		if (isDrawing && boxes.length > 0) {
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext("2d");
				if (ctx) {
					const lastBox = boxes[boxes.length - 1];
					drawBox(ctx, lastBox, boxes.length - 1);
				}
			}
		}
	}, [boxes, isDrawing]);

	return (
		<div className="multi-box-drawer-container">
			<div>
				<Divider />
				<div className="header">
					<div className="name">Drag on the image to select an area</div>
					<CloseIcon className="close-icon" onClick={toggler} />
				</div>
				<Divider />
			</div>
			<div className="canvas-container">
				<div className={`clear-btn-container ${boxes.length ? "" : "hidden"}`}>
					<div
						className="clear-btn"
						onClick={() => {
							setBoxes([]);
						}}
					>
						Clear Selections
					</div>
				</div>

				<canvas ref={canvasRef} style={{ cursor: "crosshair" }} />
				<div className="note">{`(Note: You can draw only upto 4 boxes!)`}</div>
			</div>
			<div className="done-btn-container">
				<button
					id="submit-btn"
					onClick={() => {
						setBoxList([...boxes]);
						toggler();
					}}
					className="button button--primary"
					disabled={isAddButtonDisabled}
				>
					Done
				</button>
			</div>
		</div>
	);
}

export default MultiBoxCropper;
