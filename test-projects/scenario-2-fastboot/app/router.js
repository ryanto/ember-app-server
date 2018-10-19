import EmberRouter from '@ember/routing/router';
import config from './config/environment';

const Router = EmberRouter.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('a-fastboot-route');
  this.route('header-route');
  this.route('buggy-route');
});

export default Router;
