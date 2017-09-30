const path = require("path");
const root = process.cwd();

module.exports = {
	PORT_HTTP: process.env.PORT || 3000,
	PORT_WEBSOCKET: process.env.PORT || 3000,

	CONNECT_URL_WEBSOCKET : '/',
	CONNECT_URL_HTTP : '/',

	PATH_ROOT: root,
	PATH_DIST: path.join(root,'dist'),
	PATH_SRC: path.join(root,'src'),
};
