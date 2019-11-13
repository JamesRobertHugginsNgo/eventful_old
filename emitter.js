export const propertyDescriptor = {
	defindByEventfulEmitterPropertyDescriptor: {
		value: true
	},

	eventfulEmitterEnabled: {
		writable: true
	},

	enableEmitter: {
		value() {
			this.eventfulEmitterEnabled = true;
		}
	},

	disableEmitter: {
		value() {
			this.eventfulEmitterEnabled = false;
		}
	},

	eventfulEmitterData: {
		writable: true
	},

	on: {
		value(name, handler, once = false, observer) {
			if (!this.eventfulEmitterData) {
				this.eventfulEmitterData = {};
			}
			if (!this.eventfulEmitterData[name]) {
				this.eventfulEmitterData[name] = [];
			}
			this.eventfulEmitterData[name].push({ handler, once, observer });

			if (observer && observer.defindByEventfulObserverPropertyDescriptor) {
				if (!observer.eventfulObserverData) {
					observer.eventfulObserverData = {};
				}
				if (!observer.eventfulObserverData[name]) {
					observer.eventfulObserverData[name] = [];
				}
				observer.eventfulObserverData[name].push({ emitter: this, handler, once });
			}

			return this;
		}
	},

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

							if (observer && observer.defindByEventfulObserverPropertyDescriptor) {
								if (observer.eventfulObserverData && observer.eventfulObserverData[key]) {
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
								}
							}
						} else {
							emitterIndex++;
						}
					}

					if (name != null) {
						break;
					}
				}
			}

			return this;
		}
	},

	trigger: {
		value(name, ...args) {
			if (this.eventfulEmitterEnabled !== false && this.eventfulEmitterData && this.eventfulEmitterData[name]) {
				this.eventfulEmitterData[name].forEach(({ handler, observer }) => {
					handler.call(observer || this, ...args);
				});

				this.off(name, null, true);
			}

			return this;
		}
	}
};

export function defineProperties(obj) {
	if (!obj.defindByEventfulEmitterPropertyDescriptor) {
		Object.defineProperties(obj, propertyDescriptor);
	}

	return obj;
}
