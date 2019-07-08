import { add } from './add'
import { get } from './get'
import { clear } from './clear'
import { cancel } from './cancel'
import { execute } from './execute'
import { find } from './find'
import { remove } from './remove'
import { replicate } from './replicate'
import { reschedule } from './reschedule'

var Actions = {
	add: add,
	get: get,
	find: find,
	clear: clear,
	cancel: cancel,
	execute: execute,
	remove: remove,
	replicate: replicate,
	reschedule: reschedule
}

export { Actions }