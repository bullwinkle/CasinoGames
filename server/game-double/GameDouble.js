const lodash = require("lodash");
const {
	STATUS,
	PUT_ON
} = require("./constants");


const {WS_EVENTS} = require('../../CONFIG');
const GameDoubleState = require("./State").GameDoubleState;

class GameDoubleService {
	constructor({io}){

		if (GameDoubleService.instance) {
			return GameDoubleService.instance
		}
		GameDoubleService.instance = this;

		this.io = io;
		this.gameDoubleState = new GameDoubleState({io});

		this.startGame();
	}

	initializeSocket (socket) {



		socket.on(WS_EVENTS.ACTION_UPDATE_USER,(userData,cb)=>{
			const currentState = this.gameDoubleState.toJSON();

			if ( userData == null ) {
				// no user - just update
				return cb(currentState);
			}

			if (!userData.updatedAt) {
				console.warn('UPDATE: time needed');
				return cb(currentState);
			}
			if (userData.updatedAt < currentState.updatedAt) {
				console.warn('UPDATE: old data detected, return current');
				return cb(currentState);
			}

			const userToUpdate = this.gameDoubleState.users.getBySocket(socket);

			if (userToUpdate) {
				Object.assign(userToUpdate,userData);
				this.gameDoubleState.updateTime();

				this.io.sockets.emit(
					WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,
					this.gameDoubleState.toJSON()
				);
			}
			else {
				cb(currentState);

				console.warn(`===========`);
				console.warn(``);
				console.warn(`not found user to update`);
				console.warn(currentState.users);
				console.warn(userData);
				console.warn(userToUpdate);
				console.warn(``);
				console.warn(`===========`);
			}

		});

		socket.on(WS_EVENTS.ACTION_GET_USER,(cb)=>{
			cb(this.gameDoubleState.users.getBySocket(socket))
		});

		socket.emit(
			WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,
			this.gameDoubleState.toJSON()
		);
	}

	startGame () {
		console.log('[START GAME]');

		this.gameLoop(getSecretValues());
	}

	gameLoop ({ sercretCellNumber, sercretCellDecimal }) {
		console.log('[GAME LOOP STARTED]');
		return new Promise((rs,rj)=>{
			if (this.gameDoubleState.status !== STATUS.STOPPED)
				return rj('previous loop is not finished');

			this.gameDoubleState.status = STATUS.WAITING_FOR_BETS;
			rs('ok');
		})
		.then(delay(20000))
		.then(()=>{
			this.gameDoubleState.status = STATUS.IS_PLAYING_OUT;
			this.gameDoubleState.isAnimating = true;
		})
		.then(delay(3000))
		.then(()=>{
			this.gameDoubleState.cellNumber = sercretCellNumber;
			this.gameDoubleState.cellDecimal = sercretCellDecimal;
		})
		.then(delay(6000))
		.then(()=>{

			this.gameDoubleState.status = STATUS.FINISH;
			this.gameDoubleState.isAnimating = false;

			Object.values(this.gameDoubleState.users.toJSON())
				.forEach((user)=>{
					if (!wasBetPlaced(user)) return;
					updateUser(user,this.gameDoubleState.cellNumber);
				});

		})
		.then(delay(5000))
		.then(()=>{
			return this.gameDoubleState.reset();
		})
		.then(()=>{
			console.log('[GAME LOOP FINISHED]');
			this.gameLoop(getSecretValues());
		});
	}

}

module.exports.GameDoubleService = GameDoubleService



function getSecretValues () {
	const sercretCellNumber = Math.floor(Math.random() * 14);
	const sercretCellDecimal = Number(Math.random().toFixed(2));
	return { sercretCellNumber, sercretCellDecimal };
}

function emit (socket,event,...args) {
	return io.sockets.emit(event,...args);
}

function emitBroadcast (io,event,...args) {
	return io.sockets.emit(event,...args);
}

function wasBetPlaced(user={}) {
	return !!user.betOn;
}

function isUserWinner(user, int ) {
	switch (user.betOn) {
		case PUT_ON.RED: return {
			win: (int >=1 && int < 8),
			k: 2
		};
		case PUT_ON.GREEN: return {
			win: int === 0,
			k: 14
		};
		case PUT_ON.BLACK: return {
			win: int >= 8 && int < 15,
			k: 2
		};
		default: return {
			win: false,
			k:1
		}
	}
}

function updateUser (user={},winningInt=0) {
	const {win,k} = isUserWinner(user,winningInt);
	if (win) {
		// user.betAmount = user.betAmount * k;
		user.balance = user.balance + user.betAmount * k;
	} else {
		user.balance = user.balance - user.betAmount;
	}
}

function delay (time) {
	return (...args)=> {
		return new Promise((rs)=>{
			setTimeout(()=>rs(...args),time)
		})
	}
}

function getConnectionIp (socket) {
	try {
		return socket.request.connection.remoteAddress;
	} catch (e) {
		console.warn('can`t define socket ip',e);
		return "";
	}
}

function getUserByIp (socket) {
	const userId = getConnectionIp(socket);
	if (!userId) return console.warn('cannot define ip');

	const result = users[userId]
	return result;
}
