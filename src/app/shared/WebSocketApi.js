import { io } from 'vendor';
import { CONNECT_URL_WEBSOCKET } from "../../../CONFIG";

export class WebSocketApi {

	get id () { return this.socket.id }

	constructor (url=CONNECT_URL_WEBSOCKET) {
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