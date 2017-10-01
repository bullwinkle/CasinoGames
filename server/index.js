const {GameDoubleService} =  require("./game-double/GameDouble");

const path = require('path');
const express = require('express');
const {createServer,Server} = require("http");
const createWsServer = require("socket.io");

const {PORT_HTTP,PATH_DIST,PATH_ROOT,WS_EVENTS} = require("../CONFIG");

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
app.use(express.static(path.join(PATH_ROOT,'src/assets')));
app.get('*', function (request, response) {
	console.log('request');
	response.sendFile(path.resolve(PATH_DIST, 'index.html'));
});


/* WebSocket API */

io.on('connection', (socket) => {
	console.log('\nSOCKET CONNECTION');
	console.log('connections:',getConnectionState(io).total);
	console.log('headers:',JSON.stringify(socket.handshake.headers,null,2),'\n');

	socket.on('error', (error) => {
		console.log('\nSOCKET ERROR');
		console.log('connections:',getConnectionState(io).total);
		console.log('error',error,'\n');
	});


	socket.on('disconnecting', (reason) => {
		console.log('\nSOCKET DISCONNECTING');
		console.log('connections:',getConnectionState(io).total);
		console.log('reason:',reason,'\n');
	});

	socket.on('disconnect', (reason) => {
		console.log('\nSOCKET DISCONNECT');
		console.log('connections:',getConnectionState(io).total);
		console.log('reason:',reason,'\n');
	});

	socket.send('hello, client');

	const game = new GameDoubleService({socket,io});
});


httpServer.listen(PORT_HTTP, (...args) => {
	console.log(`Server is listening on port = ${PORT_HTTP}`)
});





function getConnectionState (io) {
	return {
		total: Object.keys(io.clients().connected).length
	}
}