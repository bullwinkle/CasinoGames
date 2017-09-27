import {Backbone, Marionette, $, html2canvas, domtoimage} from 'vendor';
import {props} from 'app/decorators';
import {initBindings} from "app/shared/initBindings";
import {User} from "./models/user";
import {GameDoubleModel} from "./models/gameDouble";
import {store} from "./store";
import template from './game-duble.tpl.pug';
import "./game-double.scss";

const ANIMATION_CLASS_NAME = 'spin';

const FAKE_USER = {
	id: 1,
	nickname: 'FakeNickname',
	balance: 10000
};

@props({
	template,
	regions: {},
	className: 'game-double',
	ui: {
		animatable: '[animatable]',
		spinnerCellsContainer: '.spinner-cells',
		button: 'button.animate',
		betAction: '[bet-action]'
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
		this.user = new User();

		this.listenTo(this.user, {
			'change:balance': (m, value) => this.model.set({'user.balance': value}),
			'change:nickname': (m, value) => this.model.set({'user.nickname': value}),
		});

	}

	onRender() {
		initBindings(this.$el, 'property-binding', this.model);
		this.user.set(FAKE_USER);
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
		switch (status) {
			case GameDoubleModel.STATUS.STOPPED:
			case GameDoubleModel.STATUS.WAITING_FOR_BETS:
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
				this.model.set('currentBet', 0);
				break;
			case "last":
				this.model.set('currentBet', this.model.get('currentBet_previous'));
				break;
			case "+10":
				this.model.set('currentBet', this.model.get('currentBet') + 10);
				break;
			case "+100":
				this.model.set('currentBet', this.model.get('currentBet') + 100);
				break;
			case "+500":
				this.model.set('currentBet', this.model.get('currentBet') + 500);
				break;
			case "+1000":
				this.model.set('currentBet', this.model.get('currentBet') + 1000);
				break;
			case "1/2":
				this.model.set('currentBet', this.model.get('currentBet') / 2);
				break;
			case "x2":
				this.model.set('currentBet', this.model.get('currentBet') * 2);
				break;
			case "max":
				this.model.set('currentBet', this.model.get('user.balance'));
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
		this.stopAnimation();
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
			this.model.set({
				status: GameDoubleModel.STATUS.IS_PLAYING_OUT,
				cellNumber: Math.floor(Math.random() * 14),
				cellDecimal: Number(Math.random().toFixed(2))
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

				if (win) this.user.set('balance',this.user.get('balance') + this.model.get('currentBet') * k );
				else if (this.model.get('putOn')) {
					this.user.set('balance',this.user.get('balance') - this.model.get('currentBet') )
				}

				setTimeout(()=>{
					this.reset();

					setTimeout(()=>{this.startGame()})

				},5000)

			},9000)

		},10000)
	}
}