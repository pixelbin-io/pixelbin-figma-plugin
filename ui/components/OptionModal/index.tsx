import React, { useState, useEffect, useRef } from "react";
import styles from "./style.module.scss";
import Divider from "../Divider";

interface props {
	onOptionCLick?: (id: string) => void;
}

function OptionModal({ onOptionCLick = (id) => {} }: props) {
	const modalRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (modalRef.current && !modalRef.current.contains(event.target))
				onOptionCLick(null);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [onOptionCLick]);

	return (
		<div className={`${styles["transformation-container"]}`} ref={modalRef}>
			<div className={styles.heading}>Transformations</div>
			<div className={styles.list}>
				<div
					className={`${styles.list_item} ${styles.list_item1}`}
					onClick={() => onOptionCLick("ai")}
				>
					AI
				</div>
				<div
					className={`${styles.list_item}`}
					onClick={() => onOptionCLick("basic")}
				>
					Basic
				</div>
			</div>
		</div>
	);
}

export default OptionModal;
