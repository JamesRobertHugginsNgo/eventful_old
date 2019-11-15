import * as emitter from './emitter';
import * as observer from './observer';

export function defineAsEventful(eventful, { asEmitter = true, asObserver = true } = {}) {
	if (asEmitter) {
		eventful = emitter.defineAsEventfulEmitter(eventful);
	}

	if (asObserver) {
		eventful = observer.defineAsEventfulObserver(eventful);
	}

	return eventful;
}
