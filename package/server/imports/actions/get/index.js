import { Utilities } from '../../utilities'

var get = function (id) {
	return Utilities.collection.findOne(id);
}

export { get }