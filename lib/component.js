import Bluebird from 'bluebird';
import createDebug from 'debug';
import { cloneDeep, extend } from 'lodash';

import ContainerError from './error';

const debug = createDebug('app-container:component');

export default class Component {
  /**
   * Constructor function
   * @param  {Object}                 params                           - parameters
   * @param  {Object}                 params.container                 - parent container reference
   * @param  {String}                 params.name                      - unique component name
   * @param  {Function|Object}        params.mod                       - raw module definition
   * @param  {Object}                 [params.options={}]              - component options
   * @param  {String|String[]|Object} params.options.require           - module dependencies
   * @param  {Boolean}                [params.options.singleton=false] - singleton flag
   * @param  {String}                 params.options.type              - component type
   * @return {Component}
   */
  constructor({
    container, mod, name, options = {},
  }) {
    this.container = container;
    this.mod = mod;
    this.instances = [];
    this.options = options;
    /* eslint-disable no-param-reassign */
    if (typeof name !== 'string') {
      throw new Error('Component constructor missing required "name" option');
    }
    if (!this.options.type && typeof mod === 'object' && !Array.isArray(mod)) {
      this.options.type = 'object';
    }
    if (this.options.require && typeof this.options.require === 'string') {
      this.options.require = [this.options.require];
    }
    this.name = name;
    this.singleton = options.singleton || false;
  }

  /**
   * Load an instance of the underlying module
   * @param  {Container} container - parent container instance
   * @return {Bluebird}
   */
  load(container) {
    debug(`loading component: ${this.name}`);
    if (this.singleton && this.instances.length) {
      return Bluebird.resolve(this.instances[0]);
    }
    return this.create(container)
      .then((instance) => {
        this.instances.push(instance);
        return instance;
      })
      .catch((e) => {
        if (!(e instanceof ContainerError)) {
          const err = new ContainerError(`Error loading component (${this.name}): ${e.message}`);
          err.stack = e.stack;
          throw err;
        }
        throw e;
      });
  }

  /**
   * Create a new instance of the underlying module
   * @param  {Container} container - parent container instance
   * @return {Bluebird}
   */
  create(container) {
    debug(`creating new component: ${this.name}`);
    return Bluebird.try(() => {
      const { require: req } = this.options;
      if (req) {
        const deps = Array.isArray(req) ? req : [req];
        return container.load(...deps);
      }
      return Bluebird.resolve([]);
    })
      .then((result) => {
        const deps = Array.isArray(result) ? result : [result];
        let instance;
        if (this.options.type === 'object') {
          instance = typeof this.mod === 'object' ? cloneDeep(this.mod) : this.mod;
          if (typeof result === 'object' && !Array.isArray(result)) {
            extend(instance, result);
          }
        } else if (this.options.type === 'constructor') {
          const Mod = this.mod;
          instance = new Mod(...deps);
        } else {
          instance = this.mod(...deps);
        }
        return instance;
      })
      .then((instance) => {
        const { init } = this.options;
        if (init && typeof instance[init] === 'function') {
          debug(`initializing new component: ${this.name}`);
          return Bluebird.try(() => instance[init]()).return(instance);
        }
        return instance;
      });
  }
}
