import axios from "axios";
export function getOperationsService() {
	return axios.get(
		`https://api.pixelbin.io/service/platform/assets/v1.0/playground/plugins`
	);
}
