import {GameDoubleModel} from "./models/gameDouble";
import {User, UserCollection} from "./models/user";

const state = new GameDoubleModel();
const user = new User();
const users = new UserCollection([
	{
		name: 'one',
		icon: 'currentUser.png',
		currentBet: 1998,
		putOn: "red",
	},
	{
		name: 'two',
		icon: 'currentUser.png',
		currentBet: 17600,
		putOn: "green",
	},
	{
		name: 'three',
		icon: 'currentUser.png',
		currentBet: 5600,
		putOn: "black",
	},
	{
		name: 'four',
		icon: 'currentUser.png',
		currentBet: 2400,
		putOn: "green",
	},
	{
		name: 'five',
		icon: 'currentUser.png',
		currentBet: 20000,
		putOn: "red",
	},
	{
		name: 'six',
		icon: 'currentUser.png',
		currentBet: 27600,
		putOn: "green",
	},
	{
		name: 'seven',
		icon: 'currentUser.png',
		currentBet: 6400,
		putOn: "black",
	},
	{
		name: 'eight',
		icon: 'currentUser.png',
		currentBet: 3300,
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