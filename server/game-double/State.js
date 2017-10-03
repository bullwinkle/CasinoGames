const debounce = require("lodash/debounce");
const STATUS = require("./constants").STATUS;
const WS_EVENTS = require("../../CONFIG").WS_EVENTS;
const Users = require("./Users").Users;

class GameDoubleState {
	constructor ({io}) {
		this.io = io;
		this.emitChanges = debounce(() =>
			emit(this.io, WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,this.toJSON())
		);

		this._users = new Users({io: this.io,state:this,onChanges:this.emitChanges});
		this._updatedAt = 0;
	}

	get isAnimating () { return this._isAnimating }
	set isAnimating (val) {
		const result = this._isAnimating = val;
		this._updatedAt = Date.now();
		this.emitChanges();
		return result;
	}
	get cellNumber () { return this._cellNumber }
	set cellNumber (val) {
		const result = this._cellNumber = val;
		this._updatedAt = Date.now();
		this.emitChanges();
		return result;
	}

	get cellDecimal () { return this._cellDecimal }
	set cellDecimal (val) {
		const result = this._cellDecimal = val;
		this._updatedAt = Date.now();
		this.emitChanges();
		return result;
	}

	get status () { return this._status }
	set status (val) {
		const result = this._status = val;
		this._updatedAt = Date.now();
		this.emitChanges();
		return result;
	}

	get users () { return this._users }
	set users (val) {
		const result = this._users = val;
		this._updatedAt = Date.now();
		this.emitChanges();
		return result;
	}

	get updatedAt () { return this._updatedAt }

	reset () {
		this.status = STATUS.STOPPED;
		this.isAnimating = false;
		Object.values(this.users.toJSON()).forEach(user=>{
			user.betOn = '';
		});
		this.__updatedAt = Date.now();
	}

	toJSON () {
		return {
			cellNumber:this.cellNumber,
			cellDecimal:this.cellDecimal,
			status:this.status,
			users:this.users.toArray(),
			isAnimating: this.isAnimating,
			updatedAt: this._updatedAt
		}
	}
}
Object.assign(GameDoubleState.prototype,{
	_isAnimating: false,
	_cellNumber:0,
	_cellDecimal:0,
	_status: STATUS.STOPPED,
	_users: [],
	_updatedAt: 0
});
exports.GameDoubleState = GameDoubleState;

function emit (io,event,...args) {
	return io.sockets.emit(event,...args);
}