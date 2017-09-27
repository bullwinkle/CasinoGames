import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {GameDoubleModel} from "../models/gameDouble";
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
			PUT_ON: GameDoubleModel.PUT_ON,
		}
	}

	initialize() {
		this.model = new Backbone.Model({})
	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);

		const usersCollection = new Backbone.Collection([
			{
				name: 'foo',
				icon: 'currentUser.png',
				count: 20000
			},
			{
				name: 'maz',
				icon: 'currentUser.png',
				count: 17600
			},
			{
				name: 'baz',
				icon: 'currentUser.png',
				count: 5600
			},
			{
				name: 'zav',
				icon: 'currentUser.png',
				count: 2400
			},
		]);

		const usersColumnRedView = new GameDoubleUsersColumnView({
			from:1,
			to:7,
			upTo:2,
			color:'red',
			colorWord:'красное',
			putOn:GameDoubleModel.PUT_ON.RED,
			collection:usersCollection,
			collectionFilter: () => {

			}
		});

		const usersColumnGreenView = new GameDoubleUsersColumnView({
			from:0,
			to:undefined,
			upTo:14,
			color:'green',
			colorWord:'зелёное',
			putOn:GameDoubleModel.PUT_ON.GREEN,
			collection:usersCollection,
			collectionFilter: () => {

			}
		});

		const usersColumnBlackView = new GameDoubleUsersColumnView({
			from:8,
			to:14,
			upTo:2,
			color:'black',
			colorWord:'чёрное',
			putOn:GameDoubleModel.PUT_ON.BLACK,
			collection:usersCollection,
			collectionFilter: () => {

			}
		});

		this.showChildView('usersColumnRed',usersColumnRedView);
		this.showChildView('usersColumnGreen',usersColumnGreenView);
		this.showChildView('usersColumnBlack',usersColumnBlackView);
	}
}