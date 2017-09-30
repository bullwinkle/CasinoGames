const path = require('path');
const express = require('express');
const {createServer,Server} = require("http");
const createWsServer = require("socket.io");

const {PORT_HTTP,PATH_DIST,WS_EVENTS} = require("../CONFIG");

const app = express();
const httpServer = Server(app);

const socketIoServer = createWsServer(httpServer, {
	serveClient: true,
	// below are engine.IO options
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
}), io = socketIoServer;


/* HTTP API */

// SPA
app.use(express.static(PATH_DIST));
app.get('*', function (request, response) {
	console.log('request');
	response.sendFile(path.resolve(PATH_DIST, 'index.html'));
});


/* WebSocket API */
const gameDoubleState = {
	users: []
};

io.on('connection', (socket) => {
	console.log('\nSOCKET CONNECTION');
	console.log('connections:',Object.keys(io.clients().sockets).length);
	console.log('headers:',JSON.stringify(socket.handshake.headers,null,2),'\n');

	socket.on('error', (error) => {
		console.log('\nSOCKET ERROR');
		console.log('connections:',Object.keys(io.clients().connected).length);
		console.log('error',error,'\n');
	});


	socket.on('disconnecting', (reason) => {
		console.log('\nSOCKET DISCONNECTING');
		console.log('connections:',Object.keys(io.clients().connected).length);
		console.log('reason:',reason,'\n');
	});

	socket.on('disconnect', (reason) => {
		console.log('\nSOCKET DISCONNECT');
		console.log('connections:',Object.keys(io.clients().connected).length);
		console.log('reason:',reason,'\n');

		gameDoubleState.users = getUsers(io);

		socket.broadcast.emit(WS_EVENTS.DISCONNECTED, socketToJson(socket),gameDoubleState);
	});

	gameDoubleState.users = getUsers(io);

	socket.broadcast.emit(WS_EVENTS.CONNECTED, socketToJson(socket),gameDoubleState);

	socket.send('hello, client')

});



httpServer.listen(PORT_HTTP, (...args) => {
	console.log(`Server is listening on port = ${PORT_HTTP}`)
});







function socketsToJson (sockets={}) {
	return Object.keys(sockets).map(key=>socketToJson(sockets[key]));
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