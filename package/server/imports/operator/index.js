import { queue } from "./queue/"
import { dominator } from "./dominator/"
import { manager } from "./manager/"

Operator = {
	dominator: dominator,
	queue: queue,
	manager: manager
}

Operator.start = function () {
	Operator.dominator.initialize();
}

export { Operator }