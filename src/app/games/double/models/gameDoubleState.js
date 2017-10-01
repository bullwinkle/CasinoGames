import {props} from "app/decorators";

const STATUS = {
	STOPPED: 0,
	WAITING_FOR_BETS: 1,
	IS_PLAYING_OUT: 2,
	FINISH: 3,
};

const PUT_ON = {
	RED: 'red',
	BLACK: 'black',
	GREEN: 'green'
};

@props({
	defaults: {
		status: STATUS.STOPPED,
		range: [],
		users: [],
		// от 0 до 14) и случайное число от 0.01 до 0.99
		cellNumber: 0, // от 0 до 14
		cellDecimal: 0,// 0.01 до 0.99
		displayBalance: 10,
		isAnimating: false,
		'user.balance': 0,
		'user.nickname': '',
		'user.betAmount': '',
	},
	computed: {
		displayBalance: {
			depends: ['user.balance','user.betAmount'],
			get: (fields) => {
				const balance = parseFloat(fields['user.balance']) || 0;
				const bet = parseFloat(fields['user.betAmount']) || 0;
				return balance - bet;
			}
		},
		betAmount: {
			depends: ['user.betAmount'],
			get: (fields) => {
				return parseFloat(fields['user.betAmount']) || 0;
			}
		},
		statusName: {
			depends: ['status'],
			get: fields => {
				switch (fields.status) {
					case STATUS.STOPPED: return 'Игра остановлена';
					case STATUS.WAITING_FOR_BETS: return 'Ставки принимаются!';
					case STATUS.IS_PLAYING_OUT: return 'Ставки сделаны.';
					case STATUS.FINISH: return 'Раунд окончен.';
					default: return '';
				}
			}
		}
	}
})
export class GameDoubleState extends Backbone.Model {

	static get PUT_ON () { return PUT_ON }
	static get STATUS () { return STATUS }

	initialize () {
		this.computedFields = new Backbone.ComputedFields(this);
		this.set('range',this.generateRange())
	};

	generateRange () {
		return new Array(15).fill(0)
			/*
				цвета в соответстивии с правилами игры
			*/
			.map((el,i) => ({
				color: i===0?'green':(i>0 && i<=7)?'red':'black',
				value: i
			}))

			/*
				перемешать в случайном порядке
			*/
			// .sort(()=>{
			// 	return Math.round(Math.random()*3)-1;
			// })

			/*
				отсортитьвать массив таким образом, чтобы цвета ячеек чередовались,
				а числа при этом оставались случайными
			*/
			.reduce((result,next,i,arr)=>{
				while (arr.length) {
					if (!result.length) {
						result.push(arr.pop())
					} else {
						const lastColor = result[result.length-1].color;
						const tmpEl = arr.find(el=>el.color !== lastColor);
						if (tmpEl) {
							result.push(tmpEl);
							const tmpElIndex = arr.indexOf(tmpEl);
							arr.splice(tmpElIndex,1)
						} else {
							result.push(arr.pop())
						}
					}
				}
				return result;
			},[])
	}
}