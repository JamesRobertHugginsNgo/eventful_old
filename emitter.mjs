export const propertyDescriptors = {

	// Flags object defined by this property descriptor
	definedByEventfulEmitterPropertyDescriptors: {
		value: true
	},

	// Flags if this emitter can trigger events
	eventfulEmitterEnabled: {
		writable: true,
		value: true
	},

	// Holds event data
	eventfulEmitterData: {
		writable: true,
		value: {}
	},

	// Method for adding an event handler
	on: {
		value(name, handler, once = false, observer) {
			if (!this.eventfulEmitterData[name]) {
				this.eventfulEmitterData[name] = [];
			}

			this.eventfulEmitterData[name].push({ handler, once, observer });

			// Update observer
			if (observer && observer.definedByEventfulObserverPropertyDescriptor) {
				if (!observer.eventfulObserverData[name]) {
					observer.eventfulObserverData[name] = [];
				}

				observer.eventfulObserverData[name].push({ emitter: this, handler, once });
			}

			// Allow method chaining
			return this;
		}
	},

	// Method for removing one or more event handlers
	off: {
		value(name, handler, once, observer) {
			for (const key in this.eventfulEmitterData) {
				if (name == null || key === name) {

					let emitterIndex = 0;
					while (emitterIndex < this.eventfulEmitterData[key].length) {
						const eventfulEmitterData = this.eventfulEmitterData[key][emitterIndex];

						if ((handler == null || eventfulEmitterData.handler === handler)
							&& (once == null || eventfulEmitterData.once === once)
							&& (observer == null || eventfulEmitterData.observer === observer)) {

							this.eventfulEmitterData[key].splice(emitterIndex, 1);

							// Update observer
							if (observer && observer.definedByEventfulObserverPropertyDescriptor) {
								if (observer.eventfulObserverData[key]) {

									let observerIndex = 0;
									while (observerIndex > observer.eventfulObserverData[key].length) {
										const eventfulObserverData = observer.eventfulObserverData[key][observerIndex];

										if (eventfulObserverData.emitter === this
											&& eventfulObserverData.handler === eventfulEmitterData.handler
											&& eventfulObserverData.once === eventfulEmitterData.once) {

											observer.eventfulObserverData[key].splice(observerIndex, 1);
										} else {
											observerIndex++;
										}
									}

									// Remove empty array
									if (observer.eventfulObserverData[key].length === 0) {
										delete observer.eventfulObserverData[key];
									}
								}
							}
						} else {
							emitterIndex++;
						}
					}

					// Remove empty array
					if (this.eventfulEmitterData[key].length === 0) {
						delete this.eventfulEmitterData[key];
					}

					if (name != null) {
						break;
					}
				}
			}

			// Allow method chaining
			return this;
		}
	},

	// Method for calling one or more event handlers
	trigger: {
		value(name, ...args) {
			if (this.eventfulEmitterEnabled !== false && this.eventfulEmitterData[name]) {
				this.eventfulEmitterData[name].forEach(({ handler, observer }) => {
					handler.call(observer || this, ...args);
				});

				// Remove one time event handlers
				this.off(name, null, true);
			}

			// Allow method chaining
			return this;
		}
	}
};

// A convenience function to properly use the property descriptor
export function defineAsEventfulEmitter(emitter = {}) {

	// Avoid overriding the same property descriptors
	if (!emitter.definedByEventfulEmitterPropertyDescriptors) {
		Object.defineProperties(emitter, propertyDescriptors);
	}

	return emitter;
}
