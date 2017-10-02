import {GameDoubleState} from "./models/gameDoubleState";
import {User, UserCollection} from "./models/user";

const state = new GameDoubleState();
const user = new User();
const users = new UserCollection();

state.listenTo(user,"change",() => {
	state.set(_.transform(user.toJSON(),(res,val,key)=>{
		const newKey = `user.${key}`;
		res[newKey] = val;
		return res;
	},{}))
});

class GameDoubleStore {
	get user () { return user; }
	get users () { return users; }
	get state () { return state; }
}

const store = new GameDoubleStore();

export {store}