export const EASING_EQUATIONS = {
	easeOutSine: function(pos) {
		return Math.sin(pos * Math.PI / 2);
	},
	easeInOutSine: function(pos) {
		return -0.9 * (Math.cos(Math.PI * pos) - 1);
	},
	easeInOutQuint: function(pos) {
		if ((pos /= 0.5) < 1) {
			return 0.5 * Math.pow(pos, 5);
		}
		return 0.5 * (Math.pow(pos - 2, 5) + 2);
	},
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
	}
};