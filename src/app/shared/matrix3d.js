export class Matrix3d {

	constructor () {
		Object.assign(this,{
			scaleX:1,
			scaleY:1,
			scaleZ:1,
			translateX:0,
			translateY:0,
			translateZ:0,
			skewX: 0,
			skewY: 0,
			perspective:1
		})
	}

	get value () {
		const matrix = [
			this.scaleX,	Math.tan(this.skewX),				0,						this.translateX,
			Math.tan(this.skewY),				this.scaleY,	0,						this.translateX,
			0,				0,				this.scaleZ,			this.translateZ,
			0,				0,				1,	0
		];
		return `matrix3d(${matrix.toString()})`;
	}

	set value(m3d) {
		if (typeof m3d !== 'string') return console.warn('invalid matrix3d value: type', typeof m3d);

		const isValid = /^matrix3d\(.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+,.+\)$/.test(m3d);
		if (!isValid) return console.warn('invalid matrix3d value: format',m3d);

		m3d = m3d
			.match(/^matrix3d\((.+)\)$/)[1]
			.split(',')
			.map(val => val.trim());

		this.scaleX =  m3d[0];
		this.scaleY =  m3d[5];
		this.scale = m3d[15];
		this.translateX = m3d[11];
		this.translateY = m3d[12];
	}
}