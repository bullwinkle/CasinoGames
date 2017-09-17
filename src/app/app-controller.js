import {Radio} from '../vendor';
const appChannel = Radio.channel('app');

import {GameDouble} from './games/double/game-double'
import {NotFound} from './not-found/notfound'

export class AppController {

  home () {
    appChannel.request('update',{
      data: {},
      view: {},
      options: {}
    })
  }
  gameDouble () {
    appChannel.request('update',{
      data: {},
      view: GameDouble,
      options: {}
    })
  }
  notFound () {
    appChannel.request('update',{
      data: {},
      view: NotFound,
      options: {}
    })    
  }
}