import { io } from 'vendor';
import { WEBSOCKET_PORT } from "../../../CONFIG";

export class WebSocketApi {

	get id () { return this.socket.id }

	constructor (url=`http://0.0.0.0:${WEBSOCKET_PORT}`) {
		this.socket = io(url,{
			autoConnect: false
		});

		this.socket.on('news', (data) => {
			console.log(data);
			this.socket.emit('my other event', { my: 'data' });
		});
		this.socket.on('event',function (obj) {console.log('WS EVENT!!',obj) })
	}
	connect () { return this.socket.open(); }

	disconnect() { return this.socket.close(); }

	send(...args) { return this.socket.send(...args) }

	emit(eventName, ...args) { return this.socket.emit(eventName, ...args) }

	on(eventName, callback) { return this.socket.on(eventName,callback) }
}