import { Backbone, Marionette } from 'vendor';
import { props } from 'app/decorators';
import template from './home.tpl.pug';
import styles from "./home.scss";

@props({
	template,
	regions: {}
})
export class Home extends Marionette.View {}