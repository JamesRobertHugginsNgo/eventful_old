import * as emitter from './emitter';
import * as observer from './observer';

export function defineProperties(obj, { asEmitter = true, asObserver = true } = {}) {
	if (asEmitter) {
		obj = emitter.defineProperties(obj);
	}

	if (asObserver) {
		obj = observer.defineProperties(obj);
	}

	return obj;
}
