import {WS_EVENTS,PUT_ON} from 'app/constants';
import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {User, UserCollection} from "./models/user";
import {GameDoubleState} from "./models/gameDoubleState";
import {GameDoubleUsersView} from "./users/UsersView";
import {store} from "./store";
import {usersMock} from "./users/usersMock";

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
		betInput: '.bet-input',
		betAction: '[bet-action]',
		balanceValue: '[balance]',
		betButton: '[bet-button]'
	},
	events: {
		'animationend @ui.animatable': 'onAnimationEnd',
		'animationstart @ui.animatable': 'onAnimationStart',
		'click @ui.betAction': 'onBetActionClick',
		'click @ui.betButton': 'onBetButtonClick',
	},
	modelEvents: {
		'change:cellNumber': 'updateSpinnerValue',
		'change:cellDecimal': 'updateSpinnerValue',
		'change:status': 'onStatusChange',
		'change:isAnimating': 'onIsAnimatingChange',
		'change:user.betAmount': 'onUserBetAmountChange',
		'change:user.betOn': 'onUserBetOnChange',
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

		this.setState = this.setState.bind(this);
	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		initBindings(this.$el, 'property-binding-user', this.currentUser);

		this.showChildView("users",this.usersView);

		// this.startGame();

		this.getUser()
			.then(user=>{
				this.currentUser.set(user);
				this.initWebSocket();
			})
			.then(()=>{
				return this.updateState()
			})
			.then(this.setState)
	}

	initWebSocket () {
		this.updateState()
			.then(()=>{

				app.wsApi.on(WS_EVENTS.GAME_DOUBLE_STATE_CHANGED,(state)=>{
					console.warn('WS_EVENTS.GAME_DOUBLE_STATE_CHANGED',state);
					const {users,...other} = state;
					const currentUser = users.find(user => user.id === this.currentUser.get('id'));

					this.model.set(other);
					this.usersCollection.set(users,{merge:true});

					if (currentUser ) {
						this.currentUser.set(currentUser);
					}
				});


			})
	}

	onUserBetAmountChange () {
		this.updateState(this.currentUser.toJSON());
	}

	onUserBetOnChange () {
		this.updateState(this.currentUser.toJSON());
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

			case GameDoubleState.STATUS.FINISH:
				this.usersCollection.forEach(user=>{
					const {win,k} = isUserWinner(user,this.model.get('cellNumber'))
					const currentAmount = user.get('betAmount')
					console.log(user.get('betAmount'))
					setTimeout(()=>{
						if (win) {
							user.set('betAmount',currentAmount * k)
						} else {
							user.set('betAmount',currentAmount * -1)
						}
					})
					console.log(user)
					console.log(user.get('betAmount'))
				});
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

	getUser() {
		return new Promise((rs,rj)=>{
			app.wsApi.emit(
				WS_EVENTS.ACTION_GET_USER, rs
			)
		})
	}

	updateState (user=null) {
		return new Promise((resolve,reject)=>{
			app.wsApi.emit(
				WS_EVENTS.ACTION_UPDATE_USER,
				user,
				resolve
			)
		})
	}

	setState (state) {
		const updatedUsers = state.users;
		const updatedUser = updatedUsers.find(user => user.id === this.currentUser.get('id'));
		this.currentUser.set(updatedUser);
		this.usersCollection.set(updatedUsers,{merge:true});
		this.model.set(state);
	}
}



function isUserWinner(user, int ) {
	switch (user.get('betOn')) {
		case PUT_ON.RED: return {
			win: (int >=1 && int < 8),
			k: 2
		};
		case PUT_ON.GREEN: return {
			win: int === 0,
			k: 14
		};
		case PUT_ON.BLACK: return {
			win: int >= 8 && int < 15,
			k: 2
		};
		default: return {
			win: false,
			k:1
		}
	}
}