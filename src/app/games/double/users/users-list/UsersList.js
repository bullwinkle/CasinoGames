import {Marionette} from "vendor";
import {props} from "app/decorators";
import {UserItem} from "../users-item/UserItem";

@props({
	childView: UserItem,
	className: 'users-list'
})
export class UsersList extends Marionette.CollectionView {}