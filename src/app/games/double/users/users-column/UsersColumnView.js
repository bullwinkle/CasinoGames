import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {GameDoubleModel} from "app/games/double/models/gameDouble";
import {store} from "app/games/double/store";
import {UsersList} from "../users-list/UsersList";

@props({
	defaults: {
		from:0,
		to:0,
		upTo:0,
		count:0,
		color:'',
		colorWord:'',
		playersCount:10,
		playersTotal:10000,
		putOn:'',
		users:''
	}
})
class Model extends Backbone.Model {}

@props({
	template: require('./users-column.tpl.pug'),
	regions: {
		usersList: '[role=region][name=usersList]'
	},
	className: 'game-double_users-column l-stack',
	ui: {},
	events: {},
	modelEvents: {},
	options: {
		from:0,
		to:0,
		upTo:0,
		count:0,
		color:'',
		colorWord:'',
		playersCount:20,
		playersTotal:2000,

		achieve: 0,
		collection: null,
		collectionFilter: () => {}
	}
})
export class GameDoubleUsersColumnView extends Marionette.View {

	serializeData() {
		return {
			...this.model.toJSON(),
			...this.options,
			PUT_ON: GameDoubleModel.PUT_ON
		}
	}

	initialize() {
		this.model = new Model(this.options);
	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		initBindings(this.$el, 'property-binding-state', store.state);

		// TODO fix
		// this.options.collection.filter(this.options.collectionFilter)

		this.showChildView('usersList', new UsersList({
			collection: this.options.collection
		}));

		this.model.trigger('change');
	}
}