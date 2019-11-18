import { propertyDescriptors as emitterPropertyDescriptors } from './emitter.mjs';
import { propertyDescriptors as observerPropertyDescriptors } from './observer.mjs';

export const propertyDescriptors = Object.assign({
	definedByEventfulDictionaryPropertyDescriptors: {
		value: true
	},

	eventfulDictionaryData: {
		writable: true,
		value: {}
	},

	observeProperty: {
		value(name, value = this[name], setter = (value, setterCbk) => setterCbk(), getter = (getterCbk) => getterCbk()) {

			const propertyDescriptor = Object.getOwnPropertyDescriptor(this, name);
			if (!propertyDescriptor || (!propertyDescriptor.get && !propertyDescriptor.set)) {
				if (value !== undefined) {
					this.eventfulDictionaryData[name] = value;
				}

				delete this[name];

				Object.defineProperty(this, name, {
					configurable: true,
					enumerable: true,
					set(value) {
						if (this.eventfulDictionaryData[name] !== value) {
							const oldValue = this.eventfulDictionaryData[name];

							setter.call(this, value, () => {
								this.eventfulDictionaryData[name] = value;

								this.trigger('change', name, value, oldValue);
								this.trigger(`change:${name}`, value, oldValue);
							});
						}
					},
					get() {
						return getter.call(this, () => {
							return this.eventfulDictionaryData[name];
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
				const value = this.eventfulDictionaryData[name];

				delete this.eventfulDictionaryData[name];
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
			const json = Object.assign({}, this.eventfulDictionaryData);
			for (const key in json) {
				if (json[key].definedByEventfulDictionaryPropertyDescriptors) {
					json[key] = json[key].toJSON();
				} else if (json[key].definedByEventfulCollectionPropertyDescriptors) {
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
