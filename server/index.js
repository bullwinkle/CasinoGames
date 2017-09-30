const path = require('path');
const express = require('express');
const {createServer,Server} = require("http");
const createWsServer = require("socket.io");

const {WEBSOCKET_PORT,PATH:{ROOT,DIST,SRC}} = require("../CONFIG");

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
app.use(express.static(DIST));
app.get('*', function (request, response) {
	console.log('request');
	response.sendFile(path.resolve(DIST, 'index.html'));
});


/* WebSocket API */

io.on('connection', (socket) => {
	console.log('\nSOCKET CONNECTION');
	console.log('connections:',Object.keys(io.clients().sockets).length);
	console.log('headers:',JSON.stringify(socket.handshake.headers,null,2),'\n');

	socket.on('error', (error) => {
		console.log('\nSOCKET ERROR');
		console.log('connections:',Object.keys(io.clients().sockets).length);
		console.log('error',error,'\n');
	});

	socket.on('disconnect', (reason) => {
		console.log('\nSOCKET DISCONNECT');
		console.log('connections:',Object.keys(io.clients().sockets).length);
		console.log('reason:',reason,'\n');
	});

	socket.on('disconnecting', (reason) => {
		console.log('\nSOCKET DISCONNECTING');
		console.log('connections:',Object.keys(io.clients().sockets).length);
		console.log('reason:',reason,'\n');
	});


	socket.emit('news', { hello: 'world' });

	let counter = 0;
	setInterval(()=>{
		socket.emit('event', { counter: counter++ });
	},1000);
	socket.on('my other event', function (data) {
		console.log(data);
	});
});



httpServer.listen(WEBSOCKET_PORT, (...args) => {
	console.log(`Server is listening on port = ${WEBSOCKET_PORT}`)
});