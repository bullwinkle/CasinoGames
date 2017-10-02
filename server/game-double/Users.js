const users = {}
Object.defineProperty(users,'length',{
	get () {
		return Object.keys(this).length
	}
});

exports.Users = class Users {
	constructor ({io,state,onChanges},...arrayArgs) {
		if (io) this.io = io;
		if (state) this.state = state;
		if (onChanges) this.onChanges = typeof onChanges === 'function' ? onChanges : ()=>{};

		// const usersArray = this._array = new Array(...arrayArgs);
		//
		// const mutationMethods = ['push','pop','shift','unshift','splice'];
		// const immutableMethods = ['find','filter','concat'];
		// const arrayMethods = mutationMethods.concat(immutableMethods);
		//
		// arrayMethods.forEach((arrayMethod)=>{
		// 	this[arrayMethod] = (...args)=>{
		// 		const result = usersArray[arrayMethod](...args);
		// 		if (mutationMethods.includes(arrayMethod)) {
		// 			this.onChanges(this.toJSON());
		// 		}
		// 		return result;
		// 	}
		// });
		//
		// function updateUsers () {
		// 	const newUsers = getUsers(io)
		// 		.map(networkUser => ({
		// 			...networkUser,
		// 			...(usersArray.find(u=>u.id===networkUser.id)||{})
		// 		}));
		//
		// 	usersArray.splice(0,usersArray.length);
		// 	usersArray.push(...newUsers);
		// }

		io.on('connection', (socket) => {
			const userId = getConnectionIp(socket);
			if (users[userId]) {
				// users[userId].connections.push(socket)
			} else {
				const newUser = {
					id: userId,
					// connections: [socket]
				};
				users[userId] = userDefaults(newUser);
			}

			socket.on('disconnect', (reason) => {
				const user = users[userId];
				if (!user) return;
				const connectionIndex = users[userId].connections.indexOf(socket)
				const removedConnection = users[userId].connections.splice(connectionIndex,1)
				console.log(removedConnection)
			});

			console.log(users)
		});

	}

	getBySocket (socket) {
		const id = getConnectionIp(socket);
		return users[id]
	}

	updateById (id,data) {
		return Object.assign(users[id],data);
	}

	toJSON() {
		return users;
	}

	toArray () {
		return Object.values(users);
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	get length () {
		return Object.keys(users).length;
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
