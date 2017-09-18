import { Backbone, Marionette } from 'vendor';
import { props } from 'app/decorators';
import "./root.scss";

@props({
	template: require('./root.tpl.pug'),
	className: "main-container",
	regions: {
		content: '#content'
	}
})
export class RootView extends Marionette.View {
}