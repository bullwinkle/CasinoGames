import { Backbone, Marionette, $, Radio } from '../vendor';
import { props } from './decorators';
import { RootView } from './root/root';
import { AppState } from './app-state';
import { AppRouter } from './app-router';

const channel = new Radio.channel('app');

@props({
	region: '#application',
	channel,
	updateStack: []
})
export class App extends Marionette.Application {

	initialize() {
		console.info('app initialized');

		// handle click on licks to navigate with router
		$('body').on('click', 'a', e => {
			e.preventDefault();
			const href = $(e.currentTarget).attr('href');
			this.router.navigate(href, { trigger: true });
		})
	}

	onBeforeStart() {
		this.state = new AppState();
		this.rootView = new RootView({
			state: this.state
		});
		this.router = new AppRouter();
		this.listenTo(this.router, 'route', ( name, args ) => {
			this.state.set('route', { name, args });
		});
		this.channel.reply('update', this.update.bind(this))
	}

	onStart() {
		this.showView(this.rootView);
		Backbone.history.start({
			pushState: true
		});
	}

	/*
	  data = {
		data: ...,
		view: ...,
		options:...
	  }
	*/

	update( { data, view, options } ) {
		this.state.set('isUpdating', true);
		const updatePromise = new Promise(( resolve, reject ) => {
			try {
				const region = 'content';

				if ( data ) this.state.set(data);
				if ( typeof view === 'function' ) {
					const newView = new view(options || {});
					this.rootView.showChildView(region, newView)
				} else {
					this.rootView.getRegion(region).empty()
				}
				resolve('update ready');
			} catch ( e ) {
				reject(e);
			}
		})
		this.updateStack.push(updatePromise);
		const finallyCb = () => {
			this.updateStack.splice(
				this.updateStack.indexOf(updatePromise), 1
			);
			this.state.set('isUpdating', !!this.updateStack.length);
		};
		updatePromise.then(
			( res ) => {
				console.log('update ok')
				finallyCb(res);
				return res
			},
			( err ) => {
				console.warn('update error')
				finallyCb(err);
				throw err
			}
		);
		return updatePromise;
	}
}