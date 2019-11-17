import * as eventful from '../eventful.js';

const obj = eventful.defineAsEventful();

obj.on('test', () => {
	console.log('TEST');
});

obj.on('test', () => {
	console.log('TEST 2');
});

obj.trigger('test');

obj.off('test');

obj.on('test', () => {
	console.log('TEST 3');
});

obj.trigger('test');
