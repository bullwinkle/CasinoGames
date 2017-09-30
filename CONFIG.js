const path = require("path");
const root = process.cwd();

module.exports = {
	WEBSOCKET_PORT : process.env.PORT || 3000,
	WEBSERVER_PORT : process.env.PORT || 3000,
	PATH : {
		ROOT: root,
		DIST: path.join(root,'dist'),
		SRC: path.join(root,'src')
	}
};
