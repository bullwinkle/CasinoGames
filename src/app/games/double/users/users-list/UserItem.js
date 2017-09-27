import {Marionette} from "vendor";
import {props} from "app/decorators";

@props({
	template: require('./user-item.tpl.pug')
})
export class UserItem extends Marionette.View {}