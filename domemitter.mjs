import { propertyDescriptors as emitterPropertyDescriptors } from './emitter.mjs';

export const propertyDescriptors = Object.assign({
	definedByEventfulDomEmitterPropertyDescriptors: {
		value: true
	},

	eventfulDomEmitterListeners: {
		writable: true,
		value: {}
	}
}, emitterPropertyDescriptors, {
	on: {
		value(name, ...args) {
			if (!this.eventfulDomEmitterListeners[name]) {
				const listener = (...args) => {
					this.trigger(name, ...args);
				};
				this.addEventListener(name, listener);
				this.eventfulDomEmitterListeners[name] = listener;
			}

			return emitterPropertyDescriptors.on.value.call(this, name, ...args);
		}
	},

	off: {
		value(name, ...args) {
			const returnValue = emitterPropertyDescriptors.off.value.call(this, name, ...args);

			for (const key in this.eventfulDomEmitterListeners) {
				if (name == null || key === name) {
					if (!this.eventfulEmitterData[key]) {
						this.removeEventListener(name, this.eventfulDomEmitterListeners[key]);
						delete this.eventfulEmitterData[key];
					}

					if (name != null) {
						break;
					}
				}
			}

			return returnValue;
		}
	}
});

// A convenience function to properly use the property descriptor
export function defineAsEventfulDomEmitter(domEmitter = {}) {

	// Avoid overriding the same property descriptors
	if (!domEmitter.definedByEventfulDomEmitterPropertyDescriptors) {
		Object.defineProperties(domEmitter, propertyDescriptors);
	}

	return domEmitter;
}
