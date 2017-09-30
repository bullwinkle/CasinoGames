const {createServer} = require("http");
const {WEBSOCKET_PORT} = require("../CONFIG");
const SocketIoServer = require("socket.io");
const httpServer = createServer();

const socketIoServer = new SocketIoServer(httpServer, {
	path: '/',
	serveClient: true,
	// below are engine.IO options
	pingInterval: 10000,
	pingTimeout: 5000,
	cookie: false
}), io = socketIoServer;

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

httpServer.listen(WEBSOCKET_PORT);