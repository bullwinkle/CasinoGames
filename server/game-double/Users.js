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
		const users = getUsers(this.io);
		const usersCopy = Object.keys(users)
			.map(key=>users[key])
		;
		const restult = this.concat(usersCopy);
		return restult;
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
		betOn: 'green',
		connections: []
	}
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

function getUsers (webSocketServer) {
	return transformSocketsToUsers(webSocketServer.clients().connected);
}

function socketToJson(socket={}) {
	return {
		id: socket.id,
		referrer: socket.request.connection.remoteAddress,
		type: 'socket'
	}
}
