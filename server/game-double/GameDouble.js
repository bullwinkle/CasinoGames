const lodash = require("lodash");
const GameDoubleState = require("./State").GameDoubleState;
const {
	STATUS,
	PUT_ON
} = require("./constants");
const {usersMock} = require("../../src/app/games/double/users/usersMock");
const {WS_EVENTS} = require('../../CONFIG');


function emit (io,event,...args) {
	return io.sockets.emit(event,...args);
}

module.exports.GameDoubleService = class GameDoubleService {
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

		if (this.gameDoubleState.status !== STATUS.STOPPED) return false;
		this.gameDoubleState.status = STATUS.WAITING_FOR_BETS;

		const sercretCellNumber = Math.floor(Math.random() * 14);
		const sercretCellDecimal = Number(Math.random().toFixed(2));

		const startGameThrougn = 10000;
		const animateFor = 9000;
		const updateResultAt = 3000;
		const showResultsFor = 5000;


		setTimeout(()=>{
			this.gameDoubleState.status = STATUS.IS_PLAYING_OUT;
			this.gameDoubleState.isAnimating = true;


			setTimeout(()=>{
				this.gameDoubleState.cellNumber = sercretCellNumber;
				this.gameDoubleState.cellDecimal = sercretCellDecimal;
			},updateResultAt);

			setTimeout(()=>{
				this.gameDoubleState.status = STATUS.FINISH;
				this.gameDoubleState.isAnimating = false;

				const int = this.gameDoubleState.cellNumber;

				function isWinnerFn(user) {
					switch (user.putOn) {
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

				function betWasMade(user={}) {
					return !!user.putOn;
				}

				function updateUser (user) {
					const {win,k} = isWinnerFn(user);
					if (win) {
						user.currentBet = user.currentBet * k;
						user.balance = user.balance + user.currentBet;
					} else {
						user.balance = user.balance - user.currentBet ;
					}
				}

				this.gameDoubleState.users
					.filter(betWasMade)
					.forEach(updateUser);


				this.gameDoubleState.status = STATUS.STOPPED;
				// emit(this.io,WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,this.gameDoubleState.toJSON());


				setTimeout(()=>{
					this.gameDoubleState.reset();
					setTimeout(()=>{this.startGame()})

				},showResultsFor) // 3 showing results

			},animateFor) // 2 animation in progress

		},startGameThrougn) // 1 waiting for bets
	}

};





function transformSocketsToUsers(sockets={}) {
	const groupBy = 'referrer';
	return Object.keys(sockets)
		.map( key => socketToJson(sockets[key]) )
		.reduce((result,socketJson)=>{
			result[socketJson[groupBy]] || (result[socketJson[groupBy]] = userDefaults());
			const user = result[socketJson[groupBy]];
			if (!user.id) user.id = socketJson[groupBy];
			user.connections || (user.connections = []);
			user.connections.push(socketJson);
			return result;
		},{});
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
		currentBet: 0,
		putOn: '',
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