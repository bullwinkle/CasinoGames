exports.Users = class Users extends Array {
	constructor ({io,state,onChanges},...arrayArgs) {
		super(...arrayArgs);
		this.io = io;
		this.state = state;
		this.onChanges = typeof onChanges === 'function' ? onChanges : ()=>{};
	}
	push (...args) {
		const result = super.push(...args);
		this.onChanges(this.toJSON());
		return result;
	}

	splice (...args) {
		const result = super.splice(...args);
		this.onChanges(this.toJSON());
		return result;
	}

	toJSON() {
		return this;
	}
};