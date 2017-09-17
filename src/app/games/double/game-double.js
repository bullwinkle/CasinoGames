import {Backbone,Marionette} from '../../../vendor';
import {props} from '../../decorators';

@props({
  template: data => `hello game`,
  regions: {
  }
})
export class GameDouble extends Marionette.View {}