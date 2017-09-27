import {Matrix3d} from "./matrix3d";

export const EASING_EQUATIONS = {
	// easeOutSine: function(pos) {
	// 	return Math.sin(pos * Math.PI / 2);
	// },
	// easeInOutSine: function(pos) {
	// 	return -0.5 * (Math.cos(Math.PI * pos) - 1);
	// },
	// easeInOutQuint: function(pos) {
	// 	if ((pos /= 0.5) < 1) {
	// 		return 0.5 * Math.pow(pos, 5);
	// 	}
	// 	return 0.5 * (Math.pow(pos - 2, 5) + 2);
	// },
	bounce: function(pos) {
		if (pos < (1 / 2.75)) {
			return 7.5625 * pos * pos;
		} else if (pos < (2 / 2.75)) {
			return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
		} else if (pos < (2.5 / 2.75)) {
			return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
		} else {
			return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
		}
	},


	// no easing, no acceleration
	linear: function (t) { return t },
	// accelerating from zero velocity
	easeInQuad: function (t) { return t*t },
	// decelerating to zero velocity
	easeOutQuad: function (t) { return t*(2-t) },
	// acceleration until halfway, then deceleration
	easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
	// accelerating from zero velocity
	easeInCubic: function (t) { return t*t*t },
	// decelerating to zero velocity
	easeOutCubic: function (t) { return (--t)*t*t+1 },
	// acceleration until halfway, then deceleration
	easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
	// accelerating from zero velocity
	easeInQuart: function (t) { return t*t*t*t },
	// decelerating to zero velocity
	easeOutQuart: function (t) { return 1-(--t)*t*t*t },
	// acceleration until halfway, then deceleration
	easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
	// accelerating from zero velocity
	easeInQuint: function (t) { return t*t*t*t*t },
	// decelerating to zero velocity
	easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
	// acceleration until halfway, then deceleration
	easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
};

export function animateMatrix3d ({
	matrix,
	property,
	tagetValue = 0,
	duration=0.3,
	easing='easeInOutQuint',
	onIteration,
	onEnd
}) {
	if (!(matrix && matrix instanceof Matrix3d)) return false;
	let currentTime = 0;
	let stopped = false;

	if (typeof onIteration !== 'function') onIteration = false;
	if (typeof onEnd !== 'function') onEnd = false;

	const tick = () => {
		currentTime += 1 / 60;
		const currentPropValue = parseFloat(matrix[property]);
		const percent = currentTime / duration;
		const time = EASING_EQUATIONS[easing](percent);
		if (percent < 1) {
			const newValue = currentPropValue + (parseFloat(tagetValue) - currentPropValue) * time;
			// console.log(property,newValue)
			matrix[property] = newValue;
		} else {
			// matrix[property] = parseFloat(tagetValue;
			stopped = true;
		}

		onIteration && onIteration(matrix);

		if (stopped) {
			console.warn('animation finished!');
			return onEnd && onEnd(matrix);
		}

		requestAnimationFrame(tick);

	};
	return tick();
}