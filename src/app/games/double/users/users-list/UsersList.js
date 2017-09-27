import {Marionette} from "vendor";
import {props} from "app/decorators";
import {UserItem} from "./UserItem";

@props({
	childView: UserItem,
	className: 'users-list'
})
export class UsersList extends Marionette.CollectionView {}