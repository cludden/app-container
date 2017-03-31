import Bluebird from 'bluebird';
import createDebug from 'debug';
import { cloneDeep } from 'lodash';

const debug = createDebug('iocontainer:component');

export default class Component {
  constructor({ container, filename, mod, options }) {
    this.container = container;
    this.mod = mod;
    this.options = options;
    this.instances = [];
    /* eslint-disable no-param-reassign */
    if (!this.options.type && typeof mod === 'object' && !Array.isArray(mod)) {
      this.options.type = 'object';
    }
    this.name = this.options.name || filename.replace(/\.[^/.]+$/, '');
    this.singleton = options.singleton || false;
  }

  load(container) {
    debug(`loading component: ${this.name}`);
    if (this.singleton && this.instances.length) {
      return Bluebird.resolve(this.instances[0]);
    }
    return this.create(container)
    .then((instance) => {
      this.instances.push(instance);
      return instance;
    });
  }

  create(container) {
    debug(`creating new component: ${this.name}`);
    return Bluebird.try(() => {
      if (this.options.require) {
        return container.load(this.options.require);
      }
      return Bluebird.resolve();
    })
    .then((deps) => {
      let instance;
      if (this.options.type === 'object') {
        instance = cloneDeep(this.mod);
      } else if (this.options.type === 'constructor') {
        const Mod = this.mod;
        instance = new Mod(deps);
      } else {
        instance = this.mod(deps);
      }
      return instance;
    });
  }
}
