import { Utilities } from '../../utilities'

var generateDoc = function (input) {
	return {
		name: input.name,
		created: new Date(),
		state: "pending",
		due: function () {
			return Utilities.helpers.generateDueDate(input.config)
		}(),
		priority: function () {
			return Utilities.helpers.number(input.config.priority, "priority") || 0;
		}(),
		data: function () {
			return input.config.state || {};
		}(),
		arguments: function () {
			return input.arguments || [];
		}()
	}
}

export { generateDoc }