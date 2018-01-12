import { queue } from './queue/'
import { dominator } from './dominator/'
import { startup } from './startup/'
import { manager } from './manager/'

Operator = {
	dominator: dominator,
	queue: queue,
	manager: manager
}

export { Operator }