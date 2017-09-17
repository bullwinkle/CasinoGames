import {Backbone} from '../vendor';
import {props} from './decorators';

@props({
  defaults: {
    isUpdating: false
  }
})
export class AppState extends Backbone.Model {}