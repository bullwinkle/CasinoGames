import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {GameDoubleState} from "../models/gameDoubleState";
import {store} from "../store";
import {GameDoubleUsersColumnView} from "./users-column/UsersColumnView";

@props({
	template: require('./users.tpl.pug'),
	regions: {
		usersColumnRed: `[role="region"][name="users-column-red"]`,
		usersColumnGreen: `[role="region"][name="users-column-green"]`,
		usersColumnBlack: `[role="region"][name="users-column-black"]`,
	},
	className: 'game-double_users',
	ui: {},
	events: {},
	modelEvents: {},
})
export class GameDoubleUsersView extends Marionette.View {

	serializeData() {
		return {
			...this.model.toJSON(),
			PUT_ON: GameDoubleState.PUT_ON,
		}
	}

	initialize() {
		window.users = this;
		this.model = new Backbone.Model({})

		const usersCollection = this.usersCollection = store.users;
		this.collections = {
			red: new store.users.constructor(),
			green: new store.users.constructor(),
			black: new store.users.constructor(),
		};

		const debounced = _.debounce(this.syncCollections.bind(this));

		this.listenTo(usersCollection,'add remove reset change',debounced);

	}

	syncCollections () {
		const collections = this.usersCollection.reduce((result, user, i, arr) => {
			switch (user.get('betOn')) {
				case GameDoubleState.PUT_ON.RED:
					result.red.push(user);
					break;
				case GameDoubleState.PUT_ON.GREEN:
					result.green.push(user);
					break;
				case GameDoubleState.PUT_ON.BLACK:
					result.black.push(user);
					break;
			}
			return result;
		}, {red: [], green: [], black: []});

		_.defer(()=>{
			for (let key in collections) this.collections[key].set(collections[key],{merge:true})
		})
	}


	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		this.syncCollections();

		const usersColumnRedView = new GameDoubleUsersColumnView({
			from:1,
			to:7,
			upTo:2,
			color:'red',
			colorWord:'красное',
			betOn: GameDoubleState.PUT_ON.RED,
			collection: this.collections.red
		});

		const usersColumnGreenView = new GameDoubleUsersColumnView({
			from:0,
			to:undefined,
			upTo:14,
			color:'green',
			colorWord:'зелёное',
			betOn:GameDoubleState.PUT_ON.GREEN,
			collection: this.collections.green
		});

		const usersColumnBlackView = new GameDoubleUsersColumnView({
			from:8,
			to:14,
			upTo:2,
			color:'black',
			colorWord:'чёрное',
			betOn:GameDoubleState.PUT_ON.BLACK,
			collection: this.collections.black
		});


		this.showChildView('usersColumnRed',usersColumnRedView);
		this.showChildView('usersColumnGreen',usersColumnGreenView);
		this.showChildView('usersColumnBlack',usersColumnBlackView);
	}
}