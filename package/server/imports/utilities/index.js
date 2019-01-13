import { config } from "./config"
import { logger } from "./logger"
import { helpers } from "./helpers"
import { registry } from "./registry"
import { initializeCollection } from "./collection"

var Utilities = {
	config: config,
	logger: logger,
	helpers: helpers,
	registry: registry
}

Utilities.start = function () {
	Utilities.collection = initializeCollection();
	Utilities.config.started = true;
}

export { Utilities }