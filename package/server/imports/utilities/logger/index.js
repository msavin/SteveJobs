import { config } from "../config"

var logger = function (messages) {
	config.log(messages);
}

export { logger }