import { Marionette } from '../vendor';
import { props } from './decorators';
import { AppController } from './app-controller';

const appRoutes = {
  '(/)': 'home',
  'games/double(/)': 'gameDouble',
  '*other': 'notFound'
}

const controller = new AppController();

@props({
  appRoutes,
  controller
})
export class AppRouter extends Marionette.AppRouter {}