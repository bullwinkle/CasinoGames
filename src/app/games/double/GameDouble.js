import {WS_EVENTS} from 'app/constants';
import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {User, UserCollection} from "./models/user";
import {GameDoubleState} from "./models/gameDoubleState";
import {GameDoubleUsersView} from "./users/UsersView";
import {store} from "./store";
import {usersMock} from "./users/usersMock";
import {STATUS} from "../../../../server/game-double/constants";

const ANIMATION_CLASS_NAME = 'spin';

const FAKE_USER = {
	id: -1,
	nickname: 'FakeNickname',
	balance: 10000,
	betAmount: 10
};

@props({
	template: require('./game-duble.tpl.pug'),
	styles: require('./game-double.scss'),
	className: 'game-double',
	regions: {
		users: "[role=region][name=users]"
	},
	ui: {
		animatable: '[animatable]',
		spinnerCellsContainer: '.spinner-cells',
		betAction: '[bet-action]',
		balanceValue: '[balance]',
		betButton: '[bet-button]'
	},
	events: {
		'animationend @ui.animatable': 'onAnimationEnd',
		'animationstart @ui.animatable': 'onAnimationStart',
		'click @ui.betAction': 'onBetActionClick',
		'click @ui.betButton': 'onBetButtonClick'
	},
	modelEvents: {
		'change:cellNumber': 'updateSpinnerValue',
		'change:cellDecimal': 'updateSpinnerValue',
		'change:status': 'onStatusChange',
		'change:isAnimating': 'onIsAnimatingChange',
	}
})
export class GameDouble extends Marionette.View {

	serializeData() {
		return {
			...this.model.toJSON(),
			PUT_ON: GameDoubleState.PUT_ON
		}
	}

	initialize() {
		window.game = this;

		this.updateSpinnerValue = _.debounce(this.updateSpinnerValue);

		this.model = store.state;
		this.currentUser = store.user;
		this.usersCollection = store.users;

		this.usersView = new GameDoubleUsersView({
			collection: this.usersCollection
		});

		// this.listenTo(this.currentUser,{
		// 	'change:betOn': (m,betOn) => {
		// 		app.wsApi.emit(WS_EVENTS.ACTION_UPDATE_USER,this.currentUser.toJSON())
		// 	}
		// })
	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		initBindings(this.$el, 'property-binding-user', this.currentUser);

		this.currentUser.set(FAKE_USER);
		this.showChildView("users",this.usersView);

		// this.startGame();
		this.initWebSocket();
	}

	initWebSocket () {
		app.wsApi.on(WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,(state)=>{
			console.warn('WS_EVENTS.GAME_DOUBLE_STATE_CHANGED',state);
			const {users,...other} = state;
			const currentUser = users.find(user => user.id === this.currentUser.id);

			this.model.set(other);
			this.usersCollection.set(users,{merge:true});

			//regular updating current user
			if (currentUser && (this.currentUser.get('id') === -1 || state.status === STATUS.FINISH)) {
				this.currentUser.set(currentUser);
			}
		});


		// users to just first updating current user to know it`s user.id
		app.wsApi.on(WS_EVENTS.USER_UPDATED,(user)=>{
			console.warn('WS_EVENTS.USER_UPDATED',user);
			this.currentUser.set(user);
		});
		// App.wsApi.on(WS_EVENTS.GAME_DOUBLE_STATUS_CHANGED,(payload)=>{
		// 	console.warn('WS_EVENTS.GAME_DOUBLE_STATUS_CHANGED',payload)
		// });
	}

	reset () {
		this.model.set({
			status: GameDoubleState.STATUS.STOPPED
		});
	}

	onStatusChange (m,status) {
		const selector = 'input[name="betOn"], .bet-input, [bet-action]';
		switch (status) {

			case GameDoubleState.STATUS.STOPPED:
				this.$el.find(selector).prop('disabled',false);
				this.currentUser.set({
					betOn: ''
				});
				this.usersCollection.reset();
				break;

			case GameDoubleState.STATUS.WAITING_FOR_BETS:
				this.$el.find(selector).prop('disabled',false);
				break;

			default:
				this.$el.find(selector).prop('disabled',true);
				break;
		}
	}

	onIsAnimatingChange (m,isAnimating) {
		if (isAnimating) this.startAnimation();
		else this.stopAnimation();
	}

	onBetActionClick(e) {
		const actionName = $(e.currentTarget).attr('bet-action');
		const currentAmount = this.currentUser.get('betAmount');

		switch (actionName) {
			case "clean":
				this.currentUser.set('betAmount', 0);
				break;
			case "last":
				this.currentUser.set('betAmount', this.model.get('betAmount_previous') || 0);
				break;
			case "+10":
				this.currentUser.set('betAmount', currentAmount + 10);
				break;
			case "+100":
				this.currentUser.set('betAmount', currentAmount + 100);
				break;
			case "+500":
				this.currentUser.set('betAmount', currentAmount + 500);
				break;
			case "+1000":
				this.currentUser.set('betAmount', currentAmount + 1000);
				break;
			case "1/2":
				this.currentUser.set('betAmount', currentAmount / 2);
				break;
			case "x2":
				this.currentUser.set('betAmount', currentAmount * 2);
				break;
			case "max":
				this.currentUser.set('betAmount', this.currentUser.get('balance'));
				break;
		}
	}

	onBetButtonClick (e) {
		setTimeout(()=>{ this.submitBet(); },20)
	}

	onAnimationStart(e) {
		// console.warn('onAnimationStart', e);
	}

	onAnimationEnd(e) {
		// console.warn('onAnimationEnd', e);
		// this.ui.animatable.removeClass(ANIMATION_CLASS_NAME);
	}

	stopAnimation() {
		const isAnimationPlaying = this.ui.animatable.hasClass(ANIMATION_CLASS_NAME);

		if (isAnimationPlaying) this.ui.animatable.trigger('animationend');
		this.ui.animatable.removeClass(ANIMATION_CLASS_NAME);
	}

	startAnimation() {
		setTimeout(() => {
			this.ui.animatable.addClass(ANIMATION_CLASS_NAME);
		})
	}

	updateSpinnerValue() {
		const {range, cellNumber, cellDecimal} = this.model.pick([
			'range',
			'cellNumber',
			'cellDecimal'
		]);
		// this.startAnimation();

		const containerEl = this.ui.spinnerCellsContainer.eq(1);
		const cellIndex = range.findIndex(el => el.value === cellNumber);
		const cell = containerEl.children().eq(cellIndex);
		const parentsCenterPoint = cell.offsetParent().width() / 2 + 1;
		const {left: offsetInteger} = cell.position();
		const offsetDecimal = cell.outerWidth() * cellDecimal;
		const translateTo = parentsCenterPoint - (offsetInteger + offsetDecimal);

		this.ui.animatable.css('left', `calc(-100% + ${translateTo}px)`);
	}

	submitBet () {
		app.wsApi.emit(
			WS_EVENTS.ACTION_UPDATE_USER,
			this.currentUser.toJSON()
		)
	}
}