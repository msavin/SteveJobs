import { config } from './config'
import { logger } from './logger'
import { registry } from './registry'
import { helpers } from './helpers'
import { collection } from './collection'

var Utilities = {
	config: config,
	collection: collection,
	logger: logger,
	registry: registry,
	helpers: helpers
}

export { Utilities }