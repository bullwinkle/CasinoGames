const path = require("path");
const root = process.cwd();
const PROD = process.env.NODE_ENV === 'production';
const DEV = process.env.NODE_ENV === 'development';

module.exports.PORT_HTTP = process.env.PORT || 3000;
module.exports.PORT_WEBSOCKET = process.env.PORT || 3000;

module.exports.CONNECT_URL_WEBSOCKET = DEV ? `//localhost:${module.exports.PORT_HTTP}` : '/' ;
module.exports.CONNECT_URL_HTTP = DEV ? `//localhost:${module.exports.PORT_WEBSOCKET}` : '/' ;

module.exports.PATH_ROOT = root;
module.exports.PATH_DIST = path.join(root,'dist');
module.exports.PATH_SRC = path.join(root,'src');

module.exports.WS_EVENTS = {
	DISCONNECTED: 'DISCONNECTED',
	CONNECTED: 'CONNECTED',
	MESSAGE: 'message',

	GAME_DOUBLE_STATE_CHANGED: 'GAME_DOUBLE_STATUS_CHANGED'
};