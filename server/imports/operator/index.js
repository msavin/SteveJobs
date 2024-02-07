import { queue } from "./queue/"
import { dominator } from "./dominator/"
import { manager } from "./manager/"

const Operator = { dominator, queue, manager }

Operator.start = async function () {
	await Operator.dominator.initialize();
}

export { Operator }
