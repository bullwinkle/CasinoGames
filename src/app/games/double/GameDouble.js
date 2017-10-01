import {WS_EVENTS} from 'app/constants';
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
	id: 1,
	nickname: 'FakeNickname',
	balance: 10000,
	currentBet: 10
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
		balanceValue: '[balance]'
	},
	events: {
		'animationend @ui.animatable': 'onAnimationEnd',
		'animationstart @ui.animatable': 'onAnimationStart',
		'click @ui.betAction': 'onBetActionClick'
	},
	modelEvents: {
		'change:cellNumber': 'updateSpinnerValue',
		'change:cellDecimal': 'updateSpinnerValue',
		'change:status': 'onStatusChange'
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


		// this.listenTo(this.usersCollection,'add remove reset change',);

		this.listenTo(this.model,{
			'change:status':(m,status)=> {
				switch (status) {
					case GameDoubleState.STATUS.STOPPED:
						this.currentUser.set({
							putOn: ''
						});

						this.usersCollection.reset();
						break;
				}
			},
			'change:isAnimating': (m,isAnimating) => {
				if (isAnimating) this.startAnimation();
				else this.stopAnimation();
			}
		});
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
			console.warn('WS_EVENTS.GAME_DOUBLE_STATE_CHANGED',state)
			const {users,...other} = state;
			this.model.set(other);
			this.usersCollection.set(users,{merge:true})
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
		const selector = 'input[name="putOn"], .bet-input, [bet-action]';
		switch (status) {
			case GameDoubleState.STATUS.STOPPED:
			case GameDoubleState.STATUS.WAITING_FOR_BETS:
				this.$el.find(selector).prop('disabled',false);
				break;
			default:
				this.$el.find(selector).prop('disabled',true);
				break;
		}
	}

	onBetActionClick(e) {
		const actionName = $(e.currentTarget).attr('bet-action')
		switch (actionName) {
			case "clean":
				this.currentUser.set('currentBet', 0);
				break;
			case "last":
				this.currentUser.set('currentBet', this.model.get('currentBet_previous') || 0);
				break;
			case "+10":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') + 10);
				break;
			case "+100":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') + 100);
				break;
			case "+500":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') + 500);
				break;
			case "+1000":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') + 1000);
				break;
			case "1/2":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') / 2);
				break;
			case "x2":
				this.currentUser.set('currentBet', this.currentUser.get('currentBet') * 2);
				break;
			case "max":
				this.currentUser.set('currentBet', this.currentUser.get('balance'));
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

	startGame () {
		if (this.model.get('status') !== GameDoubleState.STATUS.STOPPED) return false;

		this.model.set('status',GameDoubleState.STATUS.WAITING_FOR_BETS);

		const usersMockClone = [...usersMock];
		const pushUserInterval = setInterval(()=>{
			this.usersCollection.push(usersMockClone.splice(Math.floor(Math.random()*usersMockClone.length),1))
		},9500/usersMockClone.length);

		setTimeout(()=>{
			this.startAnimation();
		},9000);

		setTimeout(()=>{
			this.model.set('status', GameDoubleState.STATUS.IS_PLAYING_OUT);

			setTimeout(()=>{
				this.model.set({
					cellNumber: Math.floor(Math.random() * 14),
					cellDecimal: Number(Math.random().toFixed(2))
				});
			});

			if (this.currentUser.get('currentBet') && this.currentUser.get('putOn')) {
				this.model.set({
					currentBet_previous: this.currentUser.get('currentBet')
				});
			}

			setTimeout(()=>{
				this.model.set('status',GameDoubleState.STATUS.FINISH);
				const int = this.model.get('cellNumber');

				const betWasMade = !!this.currentUser.get('putOn');
				function isWinnerFn(userModel) {
					switch (userModel.get('putOn')) {
						case GameDoubleState.PUT_ON.RED: return {
							win: (int >=1 && int < 8),
							k: 2
						};
						case GameDoubleState.PUT_ON.GREEN: return {
							win: int === 0,
							k: 14
						};
						case GameDoubleState.PUT_ON.BLACK: return {
							win: int >= 8 && int < 15,
							k: 2
						};
						default: return {
							win: false,
							k:1
						}
					}
				}

				/* Update current user state */
				if (betWasMade) {
					const {win,k} = isWinnerFn(this.currentUser);
					if (win) {
						this.currentUser.set('balance',this.currentUser.get('balance') + this.currentUser.get('currentBet') * k );
					} else {
						this.currentUser.set('balance',this.currentUser.get('balance') - this.currentUser.get('currentBet') )
					}
				}

				/* Update other users states*/
				this.usersCollection.forEach(user=>{
					const {win,k} = isWinnerFn(user);
					const usersCurrentBet = user.get('currentBet');
					if (win) user.set('currentBet',usersCurrentBet * k)
				});


				setTimeout(()=>{
					this.reset();
					setTimeout(()=>{this.startGame()})

				},2000) // 3 showing results

			},9000) // 2 animation in progress

		},10000) // 1 waiting for bets
	}
}