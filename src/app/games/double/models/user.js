import {props} from "app/decorators";

@props({
	urlRoot: '/currentUser',
	defaults: {
		id: 0,
		nickname: '',
		balance: 0,
		$fullName: '',
		firstName: '',
		lastName: '',
		currentBet: 10
	},
	computed: {
		$fullName: {
			depends: ['firstName','lastName'],
			get: (fields)=> {
				return `${fields.firstName} ${fields.lastName}`.trim();
			},
			set: (value, fields) => {
				const [firstName,lastName] = value.split(' ');
				return Object.assign(fields,{firstName, lastName});
			}
		}
	}
})
export class User extends Backbone.Model {
	initialize () {
		this.computedFields = new Backbone.ComputedFields(this);
	}
}

@props({
	url: User.prototype.urlRoot,
	model: User
})
export class UserCollection extends Backbone.Model {}