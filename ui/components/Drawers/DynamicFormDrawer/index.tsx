import React, { useState } from "react";
import { EVENTS, eraseBgOptions } from "../../../../constants";
import { Util } from "../../../../util";
import "./style.scss";

interface formProps {
	setFormValues: any;
	formValues: any;
}

function DynamicFormDrawer({ setFormValues, formValues }: formProps) {
	return (
		<div className="dfd-container">
			Dynamic Drawer
			{eraseBgOptions.map((obj, index) => {
				switch (obj.type) {
					case "enum":
						return (
							<div>
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
							</div>
						);
					case "boolean":
						return (
							<div className="checkbox">
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

					default:
						return null;
				}
			})}
		</div>
	);
}

export default DynamicFormDrawer;
