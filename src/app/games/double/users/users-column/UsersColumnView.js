import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {GameDoubleModel} from "app/games/double/models/gameDouble";
import {store} from "app/games/double/store";
import {UsersList} from "../users-list/UsersList";

const defaultOptions = {
	from:0,
	to:0,
	upTo:0,
	count:0,
	color:'',
	colorWord:'',
	playersCount:101,
	playersTotal:10000,
	greatesUserName: '',
	greatestUserBet: 0,
	putOn:''
};

@props({
	defaults: defaultOptions
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
		...defaultOptions,
		achieve: 0,
		collection: null,
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
		this.collection = this.options.collection;

		this.listenTo(this.collection,'add remove reset change',()=>{

			const {playersTotal,greatestUser} = this.collection.reduce((result,user,i)=>{
				result.playersTotal+=user.get('currentBet')
				if (!result.greatestUser || result.greatestUser.get('currentBet') < user.get('currentBet')) {
					result.greatestUser = user;
				}
				return result;
			},{playersTotal:0,greatestUser:null});

			console.warn(greatestUser);
			this.model.set({
				playersCount: this.collection.length,
				playersTotal: playersTotal,
				greatesUserName: greatestUser && greatestUser.get('name'),
				greatestUserBet: greatestUser && greatestUser.get('currentBet')
			})
		});
	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		initBindings(this.$el, 'property-binding-state', store.state);


		// TODO fix
		// this.options.collection.filter(this.options.collectionFilter)

		this.showChildView('usersList', new UsersList({
			collection: this.options.collection
		}));

		this.collection.trigger('change');
		this.model.trigger('change');
	}
}