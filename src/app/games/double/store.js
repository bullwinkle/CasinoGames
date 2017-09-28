import {GameDoubleModel} from "./models/gameDouble";
import {User, UserCollection} from "./models/user";

const state = new GameDoubleModel();
const user = new User();
const users = new UserCollection();

class GameDoubleStore {
	get user () { return user; }
	get users () { return users; }
	get state () { return state; }
}

const store = new GameDoubleStore();

export {store}