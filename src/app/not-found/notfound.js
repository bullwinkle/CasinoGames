import { Backbone, Marionette } from '../../vendor';
import { props } from '../decorators';

@props({
	template: data => `
    <h1>Not found</h1>
  `
})
export class NotFound extends Marionette.View {
}