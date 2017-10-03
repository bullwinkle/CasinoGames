const debounce = require("lodash/debounce");
const STATUS = require("./constants").STATUS;
const WS_EVENTS = require("../../CONFIG").WS_EVENTS;
const Users = require("./Users").Users;

class GameDoubleState {
	constructor ({io}) {
		this.io = io;
		this.emitChanges = debounce(() =>{
			this.updateTime();
			io.sockets.emit(WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,this.toJSON());
		});

		this._users = new Users({io: this.io,state:this,onChanges:this.emitChanges});
	}

	get updatedAt () { return this._updatedAt }

	get isAnimating () { return this._isAnimating }
	set isAnimating (val) {
		const result = this._isAnimating = val;
		this.emitChanges();
		return result;
	}
	get cellNumber () { return this._cellNumber }
	set cellNumber (val) {
		const result = this._cellNumber = val;
		this.emitChanges();
		return result;
	}

	get cellDecimal () { return this._cellDecimal }
	set cellDecimal (val) {
		const result = this._cellDecimal = val;
		this.emitChanges();
		return result;
	}

	get status () { return this._status }
	set status (val) {
		const result = this._status = val;
		this.emitChanges();
		return result;
	}

	get users () { return this._users }
	set users (val) {
		const result = this._users = val;
		this.emitChanges();
		return result;
	}

	updateTime () {
		this._updatedAt = Date.now();
	}

	reset () {
		this.status = STATUS.STOPPED;
		this.isAnimating = false;
		Object.values(this.users.toJSON()).forEach(user=>{
			user.betOn = '';
		});
		this._updatedAt = Date.now();
	}

	toJSON () {
		return {
			cellNumber:this.cellNumber,
			cellDecimal:this.cellDecimal,
			status:this.status,
			users:this.users.toArray(),
			isAnimating: this.isAnimating,
			updatedAt: this.updatedAt
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