import { propertyDescriptor as emitterPropertyDescriptor } from './emitter.mjs';

export const propertyDescriptor = Object.assign({
	definedByEventfulDomEmitterPropertyDescriptor: {
		value: true
	},

	eventfulDomEmitterListeners: {
		writable: true,
		value: {}
	}
}, emitterPropertyDescriptor, {
	on: {
		value(name, ...args) {
			if (!this.eventfulDomEmitterListeners[name]) {
				const listener = (...args) => {
					this.trigger(name, ...args);
				};
				this.addEventListener(name, listener);
				this.eventfulDomEmitterListeners[name] = listener;
			}

			return emitterPropertyDescriptor.on.value.call(this, name, ...args);
		}
	},

	off: {
		value(name, ...args) {
			const returnValue = emitterPropertyDescriptor.off.value.call(this, name, ...args);

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
