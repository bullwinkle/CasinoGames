import {Marionette} from "vendor";
import {props} from "app/decorators";
import {UserItem} from "../users-item/UserItem";

@props({
	childView: UserItem,
	className: 'users-list',
	reorderOnSort: true
})
export class UsersList extends Marionette.CollectionView {
	initialize () {
		this.model = new Backbone.Model({
			sortBy: 'betAmount', // | property name
			order: 'desc' // asc | desc
		});
	}
	viewComparator (a,b) {
		const prop = this.model.get('sortBy');
		const order = this.model.get('order');

		if (a.get(prop) > b.get(prop)) return order === 'desc'? -1 : 1;
		else if (a.get(prop) < b.get(prop)) return order === 'desc'? 1 : -1;
		else if (a.get(prop) == b.get(prop)) return 0;
	}
}