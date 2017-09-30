const {usersMock} = require("../src/app/games/double/users/usersMock");

const {WS_EVENTS} = require('../CONFIG');

const STATUS = {
	STOPPED: 0,
	WAITING_FOR_BETS: 1,
	IS_PLAYING_OUT: 2,
	FINISH: 3,
};

const PUT_ON = {
	RED: 'red',
	BLACK: 'black',
	GREEN: 'green'
};

function emit (io,event,...args) {
	return io.sockets.emit(event,...args);
}

class Users extends Array {
	constructor ({io,state},...arrayArgs) {
		super(...arrayArgs)
		this.io = io;
		this.state = state;
	}
	push (...args) {
		const result = super.push(...args);
		emit(this.io,WS_EVENTS.GAME_DOUBLE_USERS_CHANGED,this.state.toJSON());
		return result;
	}

	splice (...args) {
		const result = super.splice(...args);
		emit(this.io,WS_EVENTS.GAME_DOUBLE_USERS_CHANGED,this.state.toJSON());
		return result;
	}
}

class GameDoubleState {
	constructor ({io}) {
		this.io = io;
		this._users = new Users({io,state:this})
	}
	get cellNumber () { return this._cellNumber }
	set cellNumber (val) {
		const result = this._cellNumber = val;
		emit(this.io,WS_EVENTS.GAME_DOUBLE_CELL_NUMBER_CHANGED,this.toJSON());
		return result;
	}

	get cellDecimal () { return this._cellDecimal }
	set cellDecimal (val) {
		const result = this._cellDecimal = val;
		emit(this.io,WS_EVENTS.GAME_DOUBLE_CELL_DECIMAL_CHANGED,this.toJSON());
		return result;
	}

	get status () { return this._status }
	set status (val) {
		const result = this._status = val;
		emit(this.io,WS_EVENTS.GAME_DOUBLE_STATUS_CHANGED,this.toJSON());
		return result;
	}

	get users () { return this._users }
	set users (val) {
		const result = this._users = val;
		emit(this.io,WS_EVENTS.GAME_DOUBLE_USERS_CHANGED,this.toJSON());
		return result;
	}

	reset () {
		this.status = STATUS.STOPPED;
		this.users.splice(0,this.users.length);
	}

	toJSON () {
		return {
			cellNumber:this.cellNumber,
			cellDecimal:this.cellDecimal,
			status:this.status,
			users:this.users,
		}
	}
}
Object.assign(GameDoubleState.prototype,{
	_cellNumber:0,
	_cellDecimal:0,
	_status: STATUS.STOPPED,
	_users: [],
});


module.exports.GameDoubleService = class GameDoubleService {
	constructor({io}){

		if (GameDoubleService.instance) return GameDoubleService.instance;
		GameDoubleService.instance = this;


		this.io = io;
		this.gameDoubleState  = new GameDoubleState({io});

		// socket.on('disconnect', (reason) => {
		// 	// this.gameDoubleState.users = getUsers(io);
		//
		// 	socket.broadcast.emit(this.io,WS_EVENTS.DISCONNECTED, socketToJson(socket),this.gameDoubleState);
		// });

		// gameDoubleState.users = getUsers(io);

		emit(this.io,WS_EVENTS.CONNECTED, this.gameDoubleState);

		if (!GameDoubleService.gameStarted) {
			GameDoubleService.gameStarted = true;
			this.startGame();
		}

		if (!GameDoubleService.fakeUsersStreamStarted) {
			GameDoubleService.fakeUsersStreamStarted = true;
			this.startFakeUsersStream();
		}


	}

	startFakeUsersStream () {
		let tmpArr = usersMock.map(el=>({...el}));
		GameDoubleService.fakeUsersStreamStarted = setInterval(()=>{

			if (!tmpArr.length) {
				const clone = usersMock.map(el=>({...el}));
				console.log(clone)
				tmpArr.push( ...clone  );
			}
			const randomIndex = Math.floor(Math.random()*tmpArr.length);
			const randomUserFromList = tmpArr.splice(randomIndex,1)[0];
			console.log(randomUserFromList,randomIndex)
			if (randomUserFromList && this.gameDoubleState.status === STATUS.WAITING_FOR_BETS)
				this.gameDoubleState.users.push(randomUserFromList);
		},9500/tmpArr.length);
	}

	startGame () {
		console.log('[START GAME]')

		if (this.gameDoubleState.status !== STATUS.STOPPED) return false;

		this.gameDoubleState.status = STATUS.WAITING_FOR_BETS;

		// setTimeout(()=>{
		// 	this.startAnimation();
		// },9000);

		setTimeout(()=>{
			this.gameDoubleState.status = STATUS.IS_PLAYING_OUT;


			setTimeout(()=>{
				this.gameDoubleState.status = STATUS.FINISH;
				this.gameDoubleState.cellNumber = Math.floor(Math.random() * 14);
				this.gameDoubleState.cellDecimal = Number(Math.random().toFixed(2));

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
						user.balance = user.balance + user.currentBet * k;
					} else {
						user.balance = user.balance - user.currentBet ;
					}
				}

				this.gameDoubleState.users
					.filter(betWasMade)
					.forEach(updateUser);

				emit(this.io,WS_EVENTS.GAME_DOUBLE_USERS_CHANGED,this.gameDoubleState.toJSON())


				setTimeout(()=>{
					this.gameDoubleState.reset();
					setTimeout(()=>{this.startGame()})

				},2000) // 3 showing results

			},9000) // 2 animation in progress

		},10000) // 1 waiting for bets
	}

};




function socketsToJson (sockets={}) {
	// const groubBy = 'referrer';
	const groubBy = 'id';
	return Object.keys(sockets)
		.map( key => socketToJson(sockets[key]) )
		.reduce((result,socketJson)=>{
			result[socketJson[groubBy]] || (result[socketJson[groubBy]] = userDefaults());
			const user = result[socketJson[groubBy]];
			if (!user.id) user.id = socketJson[groubBy];
			user.connections || (user.connections = []);
			user.connections.push(socketJson);
			return result;
		},{});
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
	return socketsToJson(webSocketServer.clients().connected);
}


function getConnectionState (io) {
	return {
		total: Object.keys(io.clients().connected).length
	}
}