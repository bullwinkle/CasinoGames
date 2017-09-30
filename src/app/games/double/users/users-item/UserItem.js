import {Marionette} from "vendor";
import {props} from "app/decorators";
import {initBindings} from "../../../../shared/initBindings";

@props({
	template: require('./user-item.tpl.pug'),
	className: 'users-item'
})
export class UserItem extends Marionette.View {


	onRender() {
		initBindings(this.$el,'property-binding',this.model);
		this.$el.height(0)
	}

	onDomRefresh () {
		setTimeout(()=>{this.$el.css('height','40px')},20)
	}

	destroy (...args) {
		this.$el.css('height','0px')
		setTimeout(()=>{
			super.destroy(...args)
		},210)
	}
}