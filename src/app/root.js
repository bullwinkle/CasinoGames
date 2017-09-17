import {Backbone,Marionette} from '../vendor';
import {props} from './decorators';

@props({
  template: data => `
    <menu>
      <a href="/">home</a>
      <a href="/games/double">Games:Double</a>
      <a href="/404">404</a>
    </menu>
    <main id='content'></main>
  `,
  regions: {
      content: '#content'
  }
})
export class RootView extends Marionette.View {}