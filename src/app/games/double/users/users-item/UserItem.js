import {Marionette} from "vendor";
import {props} from "app/decorators";

@props({
	template: require('./user-item.tpl.pug'),
	className: 'users-item'
})
export class UserItem extends Marionette.View {
	onRender() {
		this.$el.height(0)
	}

	onDomRefresh () {
		setTimeout(()=>{
			this.$el.css('height','33px')
		})
	}

	destroy (...args) {
		this.$el.css('height','0px')
		this.$el.one('transitionend',()=>{
			super.destroy(...args)
		})
	}
}