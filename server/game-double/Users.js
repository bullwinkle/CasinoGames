exports.Users = class Users {
	constructor ({io,state,onChanges},...arrayArgs) {
		if (io) this.io = io;
		if (state) this.state = state;
		if (onChanges) this.onChanges = typeof onChanges === 'function' ? onChanges : ()=>{};

		const usersArray = this._array = new Array(...arrayArgs);

		const mutationMethods = ['push','pop','shift','unshift','splice'];
		const immutableMethods = ['find','filter','concat'];
		const arrayMethods = mutationMethods.concat(immutableMethods);

		arrayMethods.forEach((arrayMethod)=>{
			this[arrayMethod] = (...args)=>{
				const result = usersArray[arrayMethod](...args);
				if (mutationMethods.includes(arrayMethod)) {
					this.onChanges(this.toJSON());
				}
				return result;
			}
		});

		function updateUsers () {
			usersArray.splice(0,usersArray.length);
			usersArray.push(...getUsers(io));
		}

		io.on('connection', (socket) => {
			updateUsers();

			socket.on('disconnect', (reason) => {
				updateUsers();
			});
		});

	}

	toJSON() {
		return this._array;
	}
};



function userDefaults () {
	return {
		nickname: 'nickname',
		balance: 10000,
		name: 'firstName lastName',
		firstName: 'firstName',
		lastName: 'lastName',
		betAmount: 0,
		icon:'http://l-f-k.ru/wp-content/uploads/2016/10/user.png',
		betOn: '',
		connections: []
	}
}

function transformSocketsToUsers(sockets={}) {
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

function getUsers (webSocketServer) {
	return Object.values(
		transformSocketsToUsers(
			webSocketServer.clients().connected
		)
	);
}

function socketToJson(socket={}) {
	return {
		id: socket.id,
		referrer: socket.request.connection.remoteAddress,
		type: 'socket'
	}
}
