const USERS = {}
Object.defineProperty(USERS,'length',{
	get () {
		return Object.keys(this).length
	}
});

let _lastUpdated = 0;

exports.Users = class Users {

	get updatedAt () {
		return _lastUpdated;
	}

	update() {
		_lastUpdated = Date.now();
	}

	constructor ({io,state,onChanges},...arrayArgs) {
		this._lastUpdated = 0;

		if (io) this.io = io;
		if (state) this.state = state;
		if (onChanges) this.onChanges = typeof onChanges === 'function' ? onChanges : ()=>{};

		io.on('connection', (socket) => {
			const userId = getConnectionIp(socket);
			if (USERS[userId]) {
				// users[userId].connections.push(socket)
			} else {
				const newUser = {
					id: userId,
					nickname: `Guest (${userId})`
					// connections: [socket]
				};
				USERS[userId] = userDefaults(newUser);
			}

			socket.on('disconnect', (reason) => {
				const user = USERS[userId];
				if (!user) return;
				const connectionIndex = USERS[userId].connections.indexOf(socket)
				const removedConnection = USERS[userId].connections.splice(connectionIndex,1)
				console.log(removedConnection)
			});

			console.log(USERS)
		});

	}

	getBySocket (socket) {
		const id = getConnectionIp(socket);
		return USERS[id]
	}

	udateUser (socket) {

	}

	updateById (id,data) {
		return Object.assign(USERS[id],data);
	}

	toJSON() {
		return USERS;
	}

	toArray () {
		return Object.values(USERS);
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	get length () {
		return Object.keys(USERS).length;
	}
};



function userDefaults (obj={}) {
	return Object.assign({
		nickname: 'nickname',
		balance: 10000,
		name: 'firstName lastName',
		firstName: 'firstName',
		lastName: 'lastName',
		betAmount: 0,
		icon:'http://l-f-k.ru/wp-content/uploads/2016/10/user.png',
		betOn: '',
		connections: []
	},obj);
}

/* deprecate */ function transformSocketsToUsers(sockets={}) {
	const groupBy = 'referrer';
	return Object.keys(sockets)
		.map( key => socketToJson(sockets[key]) )
		.reduce((result,socketJson)=>{
			/*
			* map to object,grouped by {groupBy}
			* example: {
			* 		"1": { id: 1,foo:'123' },
			* 		"2": { id: 2,foo:'456' }
			* 	}
			* */
			result[socketJson[groupBy]] || (result[socketJson[groupBy]] = userDefaults());
			const user = result[socketJson[groupBy]];
			if (!user.id) user.id = socketJson[groupBy];
			const prefix = `[${user.id}]`;
			if (!user.nickname.startsWith(prefix))
				user.nickname = `${prefix} ${user.nickname}`;
			user.connections || (user.connections = []);
			user.connections.push(socketJson);
			return result;
		},{})
	;
}

/* deprecate */ function getUsers (webSocketServer) {
	return Object.values(
		transformSocketsToUsers(
			webSocketServer.clients().connected
		)
	);
}

/* deprecate */ function socketToJson(socket={}) {
	return {
		id: socket.id,
		referrer: socket.request.connection.remoteAddress,
		type: 'socket'
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
