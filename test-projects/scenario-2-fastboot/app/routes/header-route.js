import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  fastboot: service(),

  beforeModel() {
    let isFastBoot = this.get('fastboot.isFastBoot');

    if (isFastBoot) {
      let headers = this.get('fastboot.response.headers');
      headers.set('x-from-fastboot', 'with love');
    }
  },

  model() {}

});
