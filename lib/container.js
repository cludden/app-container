import Bluebird from 'bluebird';
import createDebug from 'debug';
import { DepGraph } from 'dependency-graph';
import glob from 'glob';
import { defaults, set } from 'lodash';

import Component from './component';

const debug = createDebug('app-container');
const PLUGIN = /^(all|any)!.+/g;

export default class Container {
  /**
   * Constructor function
   * @param  {Object} [options={}]
   * @param  {String} options.namespace - namespace key
   * @param  {Object} options.defaults - default module options
   * @return {Container}
   */
  constructor(options = {}) {
    this.registry = {};
    this.options = options;
  }

  /**
   * adapted from http://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function
   * @return {String|Undefined}
   * @private
   */
  static _getCallerFile() {
    try {
      const err = new Error();
      Error.prepareStackTrace = (e, stack) => stack;

      const currentfile = err.stack.shift().getFileName();
      let callerfile;
      while (err.stack.length) {
        callerfile = err.stack.shift().getFileName();
        if (currentfile !== callerfile) return callerfile;
      }
    } catch (err) {
      return undefined;
    }
    return undefined;
  }

  /**
   * Register modules that match the specified pattern
   * @param  {String} pattern - glob pattern, see glob.js
   * @param  {Object} options
   * @param  {String} options.dir - the top level directory
   */
  glob(pattern, options = {}) {
    if (!options.dir) {
      throw new Error('Missing required \'dir\' option');
    }
    const opts = Object.assign({}, options, { cwd: options.dir });
    const filenames = glob.sync(pattern, opts);
    const namespace = this.options.namespace;
    const mode = typeof namespace === 'string' ? 'namespace' : 'register';
    const caller = Container._getCallerFile();
    filenames.forEach((filename) => {
      if (`${opts.dir}/${filename}` === caller) {
        return null;
      }
      const mod = require(`${opts.dir}/${filename}`); // eslint-disable-line
      let main = mod;
      if (mod.__esModule && mod.default) {
        main = mod.default;
      }
      if (mode === 'namespace') {
        if (mod[namespace]) {
          this._registerNamespaced({ filename, main, mod, namespace });
        }
      } else {
        const register = this._register(filename);
        main(register);
      }
      return null;
    });
    this._validateDependencyGraph();
  }

  /**
   * Load one or more modules
   * @example Load a single component
   *  container.load('my-module')
   *  .then((myModule) => {
   *    // ..
   *  });
   *
   * @example Load multiple components
   *  container.load('my-module', 'my-other-module')
   *  .spread((myModule, myOtherModule) => {
   *    // ..
   *  });
   *
   * @example Load in groups
   *  container.load({
   *    services: {
   *      foo: 'services/foo',
   *      bar: 'services/bar',
   *    },
   *    models: {
   *      users: 'models/users',
   *      comments: 'models/comments',
   *    },
   *  })
   *  .then(({ services, models }) => {
   *    const { foo, bar } = services;
   *    const { users, comments } = models;
   *  });
   * @param  {...String|Object} components - components to load
   * @return {Bluebird}
   */
  load(...components) {
    return Bluebird.try(() => {
      if (components.length === 1 && typeof components[0] === 'string') {
        return this._load(components[0]);
      } else if (components.length === 1 && typeof components[0] === 'object') {
        return this._loadRecursive(components[0]);
      } else if (Array.isArray(components)) {
        return Bluebird.mapSeries(components, name => this._load(name));
      }
      throw new Error('Invalid load signature');
    });
  }

  /**
   * Load a single component by name
   * @param  {String} name
   * @return {Bluebird}
   * @private
   */
  _load(name) {
    return Bluebird.try(() => {
      if (PLUGIN.test(name)) {
        const [plugin, n] = name.split('!');
        switch (plugin) {
          case 'all':
            return this._loadAll(n);
          case 'any':
            return this._loadAny(n);
          default:
            throw new Error(`Unknown plugin ${plugin}`);
        }
      }
      const component = this.registry[name];
      if (!component) {
        throw new Error(`Unknown Component: ${name}`);
      }
      return component.load(this);
    });
  }

  /**
   * Load all components matching a given pattern into a dependency object
   * @param  {String} pattern
   * @return {Bluebird}
   * @private
   */
  _loadAll(pattern) {
    const re = new RegExp(pattern);
    const matches = Object.keys(this.registry).reduce((memo, name) => {
      /* eslint-disable no-param-reassign */
      if (re.test(name)) {
        memo[name] = name;
      }
      return memo;
    }, {});
    return this._loadRecursive(matches);
  }

  /**
   * Load any components matching a given pattern into an array of dependencies
   * @param  {String} pattern
   * @return {Bluebird}
   * @private
   */
  _loadAny(pattern) {
    return this._loadAll(pattern)
    .then(deps => Object.keys(deps).reduce((memo, name) => [...memo, deps[name]], []));
  }

  /**
   * Load a component map (recursively) where string values are replaced with their
   * respective components
   * @param  {Object} map
   * @param  {Object} [accum={}] - object to assign components to
   * @return {Bluebird}
   * @private
   */
  _loadRecursive(map, accum = {}) {
    return _loadRecursive(this, map, accum);
  }

  /**
   * Create a scoped registration function to pass to module registration functions
   * @param  {String} filename
   * @return {Function}
   * @private
   */
  _register(filename) {
    return (mod, options = {}) => {
      defaults(options, this.options.defaults || {});
      const component = new Component({ filename, mod, options });
      debug(`registering component: ${component.name}`);
      this.registry[component.name] = component;
    };
  }

  /**
   * Register a given component for modules that declare themselves via the namespaced
   * declaration style
   * @param  {Object} params
   * @param  {String} params.filename
   * @param  {*} params.main
   * @param  {Object|Function} params.mod
   * @param  {String} params.namespace
   * @private
   */
  _registerNamespaced({ filename, main, mod, namespace }) {
    let component;
    if (typeof mod[namespace] === 'function') {
      const register = this._register(filename);
      mod[namespace](register);
    } else {
      const options = mod[namespace];
      defaults(options, this.options.defaults || {});
      component = new Component({ filename, mod: main, options });
      debug(`registering component: ${component.name}`);
      this.registry[component.name] = component;
    }
  }

  /**
   * Build a dependency graph for all registered modules and ensure that a) there
   * are no circular dependencies and b) there are no missing modules
   * @private
   */
  _validateDependencyGraph() {
    // create a new dependency graph
    const graph = new DepGraph();

    // for every component in the registry, add each to the graph along along
    // with declaring its dependencies
    Object.keys(this.registry).forEach((name) => {
      const { options } = this.registry[name];
      if (!graph.hasNode(name)) {
        graph.addNode(name);
      }
      if (options.require) {
        if (Array.isArray(options.require)) {
          options.require.forEach((dep) => {
            if (PLUGIN.test(dep)) {
              return;
            }
            if (!graph.hasNode(dep)) {
              graph.addNode(dep);
            }
            graph.addDependency(name, dep);
          });
        } else if (typeof options.require === 'object') {
          _recursiveDeps(graph, name, options.require);
        }
      }
    });

    // ensure no circular dependencies and that we have a component registered
    // for every node in the graph
    const overallOrder = graph.overallOrder();
    overallOrder.forEach((name) => {
      if (!(this.registry[name] instanceof Component)) {
        throw new Error(`No component found for dependency (${name})`);
      }
    });
  }
}

/**
 * Recursively load a component map
 * @param  {Container} container
 * @param  {Object} map
 * @param  {Object} [accum={}]
 * @return {Bluebird}
 * @private
 */
function _loadRecursive(container, map, accum = {}) {
  return Bluebird.reduce(Object.keys(map), (memo, key) => {
    const path = map[key];
    if (typeof path === 'string') {
      return container._load(path)
      .then((mod) => {
        set(memo, key, mod);
        return memo;
      });
    }
    return _loadRecursive(container, path)
    .then((mods) => {
      set(memo, key, mods);
      return memo;
    });
  }, accum);
}

/**
 * Add recursive dependencies to dependency graph
 * @param  {DepGraph} graph
 * @param  {String} name - current node name
 * @param  {Object} deps - dependency map
 * @private
 */
function _recursiveDeps(graph, name, deps) {
  return Object.keys(deps).forEach((key) => {
    const dep = deps[key];
    if (PLUGIN.test(dep)) {
      return;
    }
    if (typeof dep === 'string') {
      if (!graph.hasNode(dep)) {
        graph.addNode(dep);
      }
      graph.addDependency(name, dep);
    } else if (typeof dep === 'object') {
      _recursiveDeps(graph, name, deps[key]);
    }
  });
}
