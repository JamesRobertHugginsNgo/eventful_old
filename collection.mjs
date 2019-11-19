import { propertyDescriptors as emitterPropertyDescriptors } from './emitter.mjs';
import { propertyDescriptors as observerPropertyDescriptors } from './observer.mjs';

export const propertyDescriptors = Object.assign({
	definedByEventfulCollectionPropertyDescriptors: {
		value: true
	},

	eventfulCollectionData: {
		writable: true,
		value: []
	},

	finalizeEventfulCollectionData: {
		value(startingLength) {
			while (startingLength !== this.length) {
				if (startingLength < this.length) {
					const key = String(startingLength);

					Object.defineProperty(this, key, {
						configurable: true,
						enumerable: true,
						set(value) {
							if (this.eventfulCollectionData[key] !== value) {
								const oldValue = this.eventfulCollectionData[key];
								this.eventfulCollectionData[key] = value;
								this.trigger('change', key, value, oldValue);
								this.trigger(`change:${key}`, value, oldValue);
							}
						},
						get() {
							return this.eventfulCollectionData[key];
						}
					});

					startingLength++;
				} else {
					delete this[String(startingLength - 1)];

					startingLength--;
				}
			}
		}
	},

	length: {
		get() {
			return this.eventfulCollectionData.length;
		}
	},

	toArray: {
		value() {
			const array = this.eventfulCollectionData.slice();
			array.forEach((value, index) => {
				if (value.definedByEventfulDictionaryPropertyDescriptors) {
					array[index] = value.toJSON();
				} else if (value.definedByEventfulCollectionPropertyDescriptors) {
					array[index] = value.toArray();
				}
			});
			return array;
		}
	}
}, emitterPropertyDescriptors, observerPropertyDescriptors);

['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']
	.forEach((method) => {
		propertyDescriptors[method] = {
			value(...args) {
				const startingLength = this.length;
				const returnValue = Array.prototype[method].call(this.eventfulCollectionData, ...args);
				this.finalizeEventfulCollectionData(startingLength);

				this.trigger('change');

				return returnValue;
			}
		};
	});

['concat', 'includes', 'indexOf', 'join', 'lastIndexOf', 'slice', 'toSource', 'toString', 'toLocaleString', 'entries',
	'every', 'filter', 'find', 'findIndex', 'forEach', 'keys', 'map', 'reduce', 'reduceRight', 'some', 'values']
	.forEach((method) => {
		propertyDescriptors[method] = {
			value(...args) {
				return Array.prototype[method].call(this.eventfulCollectionData, ...args);
			}
		};
	});

// A convenience function to properly use the property descriptor
export function defineAsEventfulCollection(collection = {}, value = []) {

	// Avoid overriding the same property descriptors
	if (!collection.definedByEventfulCollectionPropertyDescriptors) {
		Object.defineProperties(collection, propertyDescriptors);
	}

	collection.push(...value);

	return collection;
}
