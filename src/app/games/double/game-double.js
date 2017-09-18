import { Backbone, Marionette } from '../../../vendor';
import { props } from 'app/decorators';
import template from './game-duble.tpl.pug';
import styles from "./game-double.scss";

@props({
	template,
	regions: {},
	className: 'game-double'
})
export class GameDouble extends Marionette.View {}