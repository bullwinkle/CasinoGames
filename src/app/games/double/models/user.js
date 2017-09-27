import {props} from "app/decorators";

@props({
	defaults: {
		id: 0,
		nickname: '',
		balance: 0,
		$fullName: '',
		firstName: '',
		lastName: '',
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