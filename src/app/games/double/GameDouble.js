import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {User, UserCollection} from "./models/user";
import {GameDoubleModel} from "./models/gameDouble";
import {GameDoubleUsersView} from "./users/UsersView";
import {store} from "./store";

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
		button: 'button.animate',
		betAction: '[bet-action]',
		balanceValue: '[balance]'
	},
	events: {
		'animationend @ui.animatable': 'onAnimationEnd',
		'animationstart @ui.animatable': 'onAnimationStart',
		'click @ui.button': function () {
			this.stopAnimation();
			this.startAnimation();
		},
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
			PUT_ON: GameDoubleModel.PUT_ON
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

		this.listenTo(this.currentUser, {
			'change:balance': (m, value) => this.model.set({'user.balance': value}),
			'change:nickname': (m, value) => this.model.set({'user.nickname': value}),
			'change:currentBet': (m, value) => this.model.set({'user.currentBet': value}),
		});

	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		initBindings(this.$el, 'property-binding-user', this.currentUser);

		this.currentUser.set(FAKE_USER);
		this.showChildView("users",this.usersView);

		this.startGame();
	}

	reset () {
		this.model.set({
			putOn: '',
			status: GameDoubleModel.STATUS.STOPPED
		})
	}

	onStatusChange (m,status) {
		const selector = 'input[name="putOn"], .bet-input, [bet-action]';
		// switch (status) {
		// 	case GameDoubleModel.STATUS.STOPPED:
		// 	case GameDoubleModel.STATUS.WAITING_FOR_BETS:
		// 		this.$el.find(selector).prop('disabled',false);
		// 		break;
		// 	default:
		// 		this.$el.find(selector).prop('disabled',true);
		// 		break;
		// }
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
		console.warn('onAnimationStart', e);
	}

	onAnimationEnd(e) {
		console.warn('onAnimationEnd', e);
		this.ui.animatable.removeClass(ANIMATION_CLASS_NAME);
	}

	updateSpinnerValue() {
		const {range, cellNumber, cellDecimal} = this.model.pick([
			'range',
			'cellNumber',
			'cellDecimal'
		]);
		this.startAnimation();

		const containerEl = this.ui.spinnerCellsContainer.eq(1);
		const cellIndex = range.findIndex(el => el.value === cellNumber);
		const cell = containerEl.children().eq(cellIndex);
		const parentsCenterPoint = cell.offsetParent().width() / 2 + 1;
		const {left: offsetInteger} = cell.position();
		const offsetDecimal = cell.outerWidth() * cellDecimal;
		const translateTo = parentsCenterPoint - (offsetInteger + offsetDecimal);

		console.warn(cellNumber, cellDecimal, offsetDecimal);

		setTimeout(() => {

			this.ui.animatable.css('left', `calc(-100% + ${translateTo}px)`);

		}, 2500)
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
		if (this.model.get('status') !== GameDoubleModel.STATUS.STOPPED) return false;

		this.model.set('status',GameDoubleModel.STATUS.WAITING_FOR_BETS);

		setTimeout(()=>{
			this.startAnimation();
		},9000);

		setTimeout(()=>{
			this.model.set('status', GameDoubleModel.STATUS.IS_PLAYING_OUT);

			setTimeout(()=>{
				this.model.set({
					cellNumber: Math.floor(Math.random() * 14),
					cellDecimal: Number(Math.random().toFixed(2))
				});
			});

			if (this.model.get('currentBet') && this.model.get('putOn')) {
				this.model.set({
					currentBet_previous: this.model.get('currentBet')
				});
			}




			setTimeout(()=>{
				this.model.set('status',GameDoubleModel.STATUS.FINISH);
				const int = this.model.get('cellNumber');

				const {win,k} = (()=>{
					switch (this.model.get('putOn')) {
						case GameDoubleModel.PUT_ON.RED: return {
							win: (int >=1 && int < 8),
							k: 2
						};
						case GameDoubleModel.PUT_ON.GREEN: return {
							win: int === 0,
							k: 14
						};
						case GameDoubleModel.PUT_ON.BLACK: return {
							win: int >= 8 && int < 15,
							k: 2
						};
						default: return {
							win: false,
							k:1
						}
					}
				})();

				if (win) this.currentUser.set('balance',this.currentUser.get('balance') + this.currentUser.get('currentBet') * k );
				else if (this.model.get('putOn')) {
					this.currentUser.set('balance',this.currentUser.get('balance') - this.currentUser.get('currentBet') )
				}

				setTimeout(()=>{
					this.reset();
					setTimeout(()=>{this.startGame()})

				},2000) // 3 showing results

			},9000) // 2 animation in progress

		},10000) // 1 waiting for bets
	}
}