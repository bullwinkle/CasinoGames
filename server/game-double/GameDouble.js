const lodash = require("lodash");
const GameDoubleState = require("./State").GameDoubleState;
const {
	STATUS,
	PUT_ON
} = require("./constants");
const {usersMock} = require("../../src/app/games/double/users/usersMock");
const {WS_EVENTS} = require('../../CONFIG');

class GameDoubleService {
	constructor({socket,io}){

		if (GameDoubleService.instance) {
			socket.emit(
				WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,GameDoubleService.instance.gameDoubleState.toJSON()
			);
			return GameDoubleService.instance
		}
		GameDoubleService.instance = this;

		this.io = io;
		this.gameDoubleState = new GameDoubleState({io});

		this.startGame();
		this.startFakeUsersStream();

		setInterval(() => {
			emit(io,"CONNECTIONS",getUsers(io));
		},2000)
	}

	startFakeUsersStream () {
		let tmpArr = usersMock.map(el=>({...el}));
		let tmpArr1 = usersMock.map(el=>({...el}));
		let tmpArr2 = usersMock.map(el=>({...el}));
		GameDoubleService.fakeUsersStreamStarted = setInterval(()=>{

			if (this.gameDoubleState.status !== STATUS.WAITING_FOR_BETS) {
				return;
			}

			if (!tmpArr.length) {
				const clone = usersMock.map(el=>({...el}));
				tmpArr.push( ...clone  );
			}
			const randomIndex = Math.floor(Math.random()*tmpArr.length);
			const randomUserFromList = tmpArr.splice(randomIndex,1)[0];
			if (randomUserFromList)
				this.gameDoubleState.users.push(randomUserFromList);
		},9500/tmpArr.length);

		return GameDoubleService.fakeUsersStreamStarted;
	}

	startGame () {
		console.log('[START GAME]');

		this.gameLoop(getSecretValues());
	}


	gameLoop ({ sercretCellNumber, sercretCellDecimal }) {
		console.log('[GAME LOOP STARTED]')
		return new Promise((rs,rj)=>{
			if (this.gameDoubleState.status !== STATUS.STOPPED) return rj('previous loop is not finished');
			this.gameDoubleState.status = STATUS.WAITING_FOR_BETS;
			rs('ok');
		})
		.then(delay(10000))
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

			this.gameDoubleState.users
				.filter(wasBetPlaced)
				.forEach( user =>
					updateUser(user,this.gameDoubleState.cellNumber)
				);

			this.gameDoubleState.status = STATUS.STOPPED;
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

function emit (io,event,...args) {
	return io.sockets.emit(event,...args);
}

function wasBetPlaced(user={}) {
	return !!user.betOn;
}

function transformSocketsToUsers(sockets={}) {
	const groupBy = 'referrer';
	return Object.keys(sockets)
		.map( key => socketToJson(sockets[key]) )
		.reduce((result,socketJson)=>{
			result[socketJson[groupBy]] || (result[socketJson[groupBy]] = userDefaults());
			const user = result[socketJson[groupBy]];
			if (!user.id) user.id = socketJson[groupBy];
			const prefix = `[${user.id}]`;
			if (!user.nickname.startsWith(prefix))
				user.nickname = `${prefix} ${user.nickname}`;
			user.connections || (user.connections = []);
			user.connections.push(socketJson);
			return result;
		},{});
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
		user.betAmount = user.betAmount * k;
		user.balance = user.balance + user.betAmount;
	} else {
		user.balance = user.balance - user.betAmount ;
	}
}

function getUsers (webSocketServer) {
	return transformSocketsToUsers(webSocketServer.clients().connected);
}

function userDefaults () {
	return {
		nickname: 'nickname',
		balance: 10000,
		$fullName: 'firstName lastName',
		firstName: 'firstName',
		lastName: 'lastName',
		betAmount: 0,
		betOn: '',
		connections: []
	}
}

function socketToJson(socket={}) {
	return {
		id: socket.id,
		referrer: socket.request.connection.remoteAddress,
		type: 'socket'
	}
}

function getUsers (webSocketServer) {
	return transformSocketsToUsers(webSocketServer.clients().connected);
}

function getConnectionState (io) {
	return {
		total: Object.keys(io.clients().connected).length
	}
}

function delay (time) {
	return (...args)=> {
		return new Promise((rs)=>{
			setTimeout(()=>rs(...args),time)
		})
	}
}