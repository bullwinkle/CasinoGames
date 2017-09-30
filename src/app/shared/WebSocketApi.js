import { io } from 'vendor';
import { CONNECT_URL_WEBSOCKET, WS_EVENTS } from "../../../CONFIG";

export class WebSocketApi {

	get id () { return this.socket.id }

	constructor (url=CONNECT_URL_WEBSOCKET) {
		this.socket = io(url,{
			autoConnect: false
		});


		this.socket.on(WS_EVENTS.CONNECTED, (...data) => {
			console.log('WS_EVENTS.CONNECTED',...data);
		});

		this.socket.on(WS_EVENTS.DISCONNECTED, (...data) => {
			console.log('WS_EVENTS.DISCONNECTED',...data);
		});
	}
	connect () { return this.socket.open(); }

	disconnect() { return this.socket.close(); }

	send(...args) { return this.socket.send(...args) }

	emit(eventName, ...args) { return this.socket.emit(eventName, ...args) }

	on(eventName, callback) { return this.socket.on(eventName,callback) }
}