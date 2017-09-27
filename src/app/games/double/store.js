import {GameDoubleModel} from "./models/gameDouble";

const state = new GameDoubleModel();

class GameDoubleStore {
	get state () { return state; }
}

const store = new GameDoubleStore();

export {store}