import {GameDoubleModel} from "./models/gameDouble";
import {User, UserCollection} from "./models/user";

const state = new GameDoubleModel();
const user = new User();
const users = new UserCollection([
	{
		name: 'foo',
		icon: 'currentUser.png',
		count: 20000,
		putOn: "red",
	},
	{
		name: 'maz',
		icon: 'currentUser.png',
		count: 17600,
		putOn: "green",
	},
	{
		name: 'baz',
		icon: 'currentUser.png',
		count: 5600,
		putOn: "black",
	},
	{
		name: 'zav',
		icon: 'currentUser.png',
		count: 2400,
		putOn: "green",
	},
]);

class GameDoubleStore {
	get user () { return user; }
	get users () { return users; }
	get state () { return state; }
}

const store = new GameDoubleStore();

export {store}