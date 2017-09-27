import {props} from "app/decorators";

@props({
	defaults: {
		range: [],
		users: [],
		// от 0 до 14) и случайное число от 0.01 до 0.99
		cellNumber: 0, // от 0 до 14
		cellDecimal: 0,// 0.01 до 0.99
		currentBet: 0,
		putOn: '',
		'user.balance': 0,
		'user.nickname': '',
		displayBalance: 10
	},
	computed: {
		displayBalance: {
			depends: ['user.balance','currentBet'],
			get: (fields) => {
				const balance = parseFloat(fields['user.balance']) || 0;
				const bet = parseFloat(fields['currentBet']) || 0;
				return balance - bet;
			}
		},
		currentBet: {
			depends: ['currentBet'],
			get: (fields) => {
				return parseFloat(fields['currentBet']) || 0;
			}
		}
	}
})
export class GameDoubleModel extends Backbone.Model {

	static get PUT_ON () {
		return {
			RED: 'red',
			BLACK: 'black',
			GREEN: 'green'
		}
	}

	initialize () {
		this.computedFields = new Backbone.ComputedFields(this);
		this.set('range',this.generateRange())
	}

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
					console.log(arr.length)
				}
				return result;
			},[])
	}
}