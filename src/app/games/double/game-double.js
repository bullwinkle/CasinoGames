import { Backbone, Marionette, html2canvas,domtoimage } from 'vendor';
import { props } from 'app/decorators';
import template from './game-duble.tpl.pug';
import styles from "./game-double.scss";

@props({
	template,
	regions: {},
	className: 'game-double',
	ui: {
		spinner: '.spinner',
		spinnerCellsContainer: '.spinner-cells',
		spinnerCopy: '.spinner-copy'
	}
})
export class GameDouble extends Marionette.View {

	initialize () {
		this.model = new Backbone.Model({
			range: (()=>{

				/*
				создать массив из 15и объектов и перемешать
				*/

				const tmpAr = new Array(15).fill(0)
					.map((el,i) => ({
						color: i===0?'green':(i>0 && i<=7)?'red':'black',
						value: i
					}))
					.sort(()=>{
						return Math.round(Math.random()*3)-1;
					});


				/*
				отсортитьвать массив таким образом, чтобы цвета ячеек чередовались,
				а числа при этом оставались случайными
				*/

				const result = [];
				while (tmpAr.length) {
					if (!result.length || result[result.length-1].color === 'green') {
						result.push(tmpAr.pop())
					} else {
						const lastColor = result[result.length-1].color;
						const tmpEl = tmpAr.find(el=>el.color !== lastColor);
						if (tmpEl) {
							result.push(tmpEl);
							const tmpElIndex = tmpAr.indexOf(tmpEl);
							tmpAr.splice(tmpElIndex,1)
						} else {
							result.push(tmpAr.pop())
						}
					}
					console.log(tmpAr.length)
				}
				return result;
			})()
		});
	}

	serializeData () {
		return {
			...this.model.toJSON()
		}
	}
}