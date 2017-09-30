const path = require("path");
const root = process.cwd();

module.exports = {
	WEBSOCKET_PORT : '80',
	WEBSERVER_PORT : '80',
	PATH : {
		ROOT: root,
		DIST: path.join(root,'dist'),
		SRC: path.join(root,'src')
	}
};
