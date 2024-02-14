import React, { useEffect, useRef, useState } from "react";
import Divider from "../../../Divider";
import { ReactComponent as CloseIcon } from "../../../../../assets/close.svg";
import "./style.scss";

interface BoxProps {
	url: string;
	toggler: () => void;
	setCordinates: (obj: any) => void;
}

function SingleCropper({ url, toggler, setCordinates }: BoxProps) {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [box, setBox] = useState<{
		top: number;
		left: number;
		width: number;
		height: number;
	} | null>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	let image = new Image();
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
					if (box) {
						drawBox(ctx, box);
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
	}, [url, box]);

	const drawBox = (
		ctx: CanvasRenderingContext2D,
		currentBox: { top: number; left: number; width: number; height: number }
	) => {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		ctx.drawImage(image, 0, 0, ctx.canvas.width, ctx.canvas.height);

		const reducedLeft = Math.round(
			(currentBox.left / image.width) * ctx.canvas.width
		);
		const reducedTop = Math.round(
			(currentBox.top / image.height) * ctx.canvas.height
		);
		const reducedWidth = Math.round(
			(currentBox.width / image.width) * ctx.canvas.width
		);
		const reducedHeight = Math.round(
			(currentBox.height / image.height) * ctx.canvas.height
		);

		ctx.strokeStyle = "black";
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]); // Set line dash pattern
		ctx.strokeRect(reducedLeft, reducedTop, reducedWidth, reducedHeight);
	};

	const handleMouseDown = (e: MouseEvent) => {
		const canvas = canvasRef.current;
		if (canvas) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Calculate original coordinates based on the aspect ratio adjustment
			const originalLeft = Math.round((mouseX / canvas.width) * image.width);
			const originalTop = Math.round((mouseY / canvas.height) * image.height);

			setBox({ top: originalTop, left: originalLeft, width: 0, height: 0 });
			setIsDrawing(true);
		}
	};

	const handleMouseUp = () => {
		setIsDrawing(false);
		if (box) {
			console.log("Box Details:", box);
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		const canvas = canvasRef.current;
		if (canvas && isDrawing) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;

			// Calculate original coordinates based on the aspect ratio adjustment
			const originalWidth = Math.round(
				(mouseX / canvas.width) * image.width - box.left
			);
			const originalHeight = Math.round(
				(mouseY / canvas.height) * image.height - box.top
			);

			setBox((prevBox) => ({
				...prevBox,
				width: originalWidth,
				height: originalHeight,
			}));
		}
	};

	useEffect(() => {
		if (box && isDrawing) {
			const canvas = canvasRef.current;
			if (canvas) {
				const ctx = canvas.getContext("2d");
				if (ctx) {
					drawBox(ctx, box);
				}
			}
		}
	}, [box, isDrawing]);

	return (
		<div className="image-box-drawer-container">
			<div>
				<Divider />
				<div className="header">
					<div className="name">Drag on image to select area</div>
					<CloseIcon className="close-icon" onClick={toggler} />
				</div>
				<Divider />
			</div>
			<div className="canvas-container">
				<canvas ref={canvasRef} style={{ cursor: "crosshair" }} />
			</div>

			<div className="done-btn-container">
				<button
					id="submit-btn"
					onClick={() => {
						setCordinates({
							top: Math.round(box?.top || 0),
							left: Math.round(box?.left || 0),
							width: Math.round(box?.width || 0),
							height: Math.round(box?.height || 0),
						});
						toggler();
					}}
					className="button button--primary"
				>
					Done
				</button>
			</div>
		</div>
	);
}

export default SingleCropper;
