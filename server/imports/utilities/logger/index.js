import { config } from "../config"

const logger = function (messages) {
	config.log(messages);
}

export { logger }