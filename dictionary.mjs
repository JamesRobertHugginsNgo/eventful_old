import { propertyDescriptors as emitterPropertyDescriptors } from './emitter.mjs';
import { propertyDescriptors as observerPropertyDescriptors } from './observer.mjs';

export const propertyDescriptors = Object.assign({
	definedByEventfulDictionaryPropertyDescriptors: {
		value: true
	},

	eventfulDictionaryPropertyData: {
		writable: true,
		value: {}
	},

	observeProperty: {
		value(name, value = this[name], setter = (value, setterCbk) => setterCbk(), getter = (getterCbk) => getterCbk()) {

			const propertyDescriptor = Object.getOwnPropertyDescriptor(this, name);
			if (!propertyDescriptor || (!propertyDescriptor.get && !propertyDescriptor.set)) {
				if (value !== undefined) {
					this.eventfulDictionaryPropertyData[name] = value;
				}

				delete this[name];

				Object.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					set(value) {
						if (this.eventfulDictionaryPropertyData[name] !== value) {
							const oldValue = this.eventfulDictionaryPropertyData[name];

							setter.call(this, value, () => {
								this.eventfulDictionaryPropertyData[name] = value;

								this.trigger('change', name, value, oldValue);
								this.trigger(`change:${name}`, value, oldValue);
							});
						}
					},
					get() {
						return getter.call(this, () => {
							return this.eventfulDictionaryPropertyData[name];
						});
					}
				});
			}

			// Allow method chaining
			return this;
		}
	},

	unobserveProperty: {
		value(name) {
			const propertyDescriptor = Object.getOwnPropertyDescriptor(this, name);
			if (propertyDescriptor && (propertyDescriptor.get || propertyDescriptor.set)) {
				const value = this.eventfulDictionaryPropertyData[name];

				delete this.eventfulDictionaryPropertyData[name];
				delete this[name];

				if (value !== undefined) {
					this[name] = value;
				}
			}

			// Allow method chaining
			return this;
		}
	},

	toJSON: {
		value() {
			const json = Object.assign({}, this.eventfulDictionaryPropertyData);
			for (const key in json) {
				if (json[key].definedByEventfulDictionaryPropertyDescriptor) {
					json[key] = json[key].toJSON();
				} else if (json[key].definedByEventfulCollectionPropertyDescriptor) {
					json[key] = json[key].toArray();
				}
			}
			return json;
		}
	}
}, emitterPropertyDescriptors, observerPropertyDescriptors);

// A convenience function to properly use the property descriptor
export function defineAsEventfulDictionary(dictionary = {}) {

	// Avoid overriding the same property descriptors
	if (!dictionary.definedByEventfulDictionaryPropertyDescriptors) {
		Object.defineProperties(dictionary, propertyDescriptors);
	}

	return dictionary;
}
