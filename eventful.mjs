import { defineAsEventfulEmitter } from './emitter.mjs';
import { defineAsEventfulObserver } from './observer.mjs';

export function defineAsEventful(eventful = {}, { asEmitter = true, asObserver = true } = {}) {
	if (asEmitter) {
		eventful = defineAsEventfulEmitter(eventful);
	}

	if (asObserver) {
		eventful = defineAsEventfulObserver(eventful);
	}

	return eventful;
}
