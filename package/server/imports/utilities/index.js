import { config } from './config'
import { logger } from './logger'
import { helpers } from './helpers'
import { registry } from './registry'
import { collection } from './collection'

var Utilities = {
	config: config,
	logger: logger,
	helpers: helpers,
	registry: registry,
	collection: collection,
}

export { Utilities }