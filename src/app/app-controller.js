import { Radio } from '../vendor';

const appChannel = Radio.channel('app');

import { GameDouble } from './games/double/GameDouble'
import { NotFound } from './not-found/notfound'
import {Home} from "./home/Home";

export class AppController {

	home() {
		appChannel.request('update', {
			data: {},
			view: Home,
			options: {}
		})
	}

	gameDouble() {
		appChannel.request('update', {
			data: {},
			view: GameDouble,
			options: {}
		})
	}

	notFound() {
		appChannel.request('update', {
			data: {},
			view: NotFound,
			options: {}
		})
	}
}