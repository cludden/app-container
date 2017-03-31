import Bluebird from 'bluebird';

export default class Component {
  constructor({ filename, mod, options }) {
    this.singleton = options.singleton || false;
    this.mod = mod;
    this.options = options;
    this.instances = [];
    /* eslint-disable no-param-reassign */
    if (!options.type && !(typeof mod === 'object' && !Array.isArray(mod))) {
      options.type = 'object';
    }
    this.name = this.options.name || filename.replace(/\.[^/.]+$/, '');
  }

  get(container) {
    return Blue;
  }
}
