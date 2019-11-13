export const propertyDescriptor = {
	defindByEventfulObserverPropertyDescriptor: {
		value: true
	},

	eventfulObserverData: {
		writable: true
	},

	listenTo: {
		value(emitter, name, handler, once = false) {
			if (emitter.defindByEventfulEmitterPropertyDescriptor) {
				emitter.on(name, handler, once, this);
			}

			return this;
		}
	},

	stopListening: {
		value(emitter, name, handler, once) {
			if (this.eventfulObserverData) {
				for (const key in this.eventfulObserverData) {
					if (name == null || key === name) {
						const emitters = [];

						for (let index = 0, length = this.eventfulObserverData[key].length; index < length; index++) {
							const eventfulObserverData = this.eventfulObserverData[key][index];
							if (emitter == null || eventfulObserverData.emitter === emitter) {
								if (emitters.indexOf(eventfulObserverData.emitter) === -1) {
									emitters.push(eventfulObserverData.emitter);
								}
							}

							if (emitter != null) {
								break;
							}
						}

						emitters.forEach((emitter) => {
							if (emitter.defindByEventfulEmitterPropertyDescriptor) {
								emitter.off(key, handler, once, this);
							}
						});

						if (name != null) {
							break;
						}
					}
				}
			}

			return this;
		}
	}
};

export function defineProperties(obj) {
	if (!obj.defindByEventfulObserverPropertyDescriptor) {
		Object.defineProperties(obj, propertyDescriptor);
	}

	return obj;
}
