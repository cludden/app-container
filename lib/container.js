import Bluebird from 'bluebird';
import createDebug from 'debug';
import { DepGraph } from 'dependency-graph';
import glob from 'glob';
import { attempt, defaults, set } from 'lodash';

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
   * @param  {Object} options - glob options
   */
  glob(pattern, options = {}) {
    if (!Object.prototype.hasOwnProperty.call(options, 'cwd')) {
      options.cwd = process.cwd(); // eslint-disable-line
    }
    const filenames = glob.sync(pattern, options);
    const namespace = this.options.namespace || 'inject';
    const caller = Container._getCallerFile();
    filenames.forEach((filename) => {
      if (`${options.cwd}/${filename}` === caller) {
        debug(`ignoring calling file: ${filename}`);
        return null;
      }
      debug(`registering component: ${filename}`);
      const result = attempt(() => {
        this._registerFile({ filename, namespace, options });
      });
      if (result instanceof Error) {
        debug(`error registering component: ${filename}`, result);
      }
      return null;
    });
    this._validateDependencyGraph();
  }

  /**
   * Load one or more modules
   * @example Load a single component
   *  const myModule = await container.load('my-module')
   *
   * @example Load multiple components
   *  const [myModule, myOtherModule] = await container.load('my-module', 'my-other-module')
   *  // or
   *  const [myModule, myOtherModule] = await container.load([
   *    'my-module',
   *    'my-other-module'
   *  ])
   *
   * @example Load in groups
   *  const { services, models } = await container.load({
   *    services: {
   *      foo: 'services/foo',
   *      bar: 'services/bar',
   *    },
   *    models: {
   *      users: 'models/users',
   *      comments: 'models/comments',
   *    },
   *  })
   *  const { foo, bar } = services;
   *  const { users, comments } = models;
   *
   * @param  {...String|Object} components - components to load
   * @return {Bluebird}
   */
  load(...components) {
    return Bluebird.try(() => {
      if (components.length === 1 && Array.isArray(components[0])) {
        return this.load(...components[0]);
      } else if (components.length === 1 && typeof components[0] === 'string') {
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
   * Manually register a module spec with the container instance
   * @param  {Object}    mod          - module spec
   * @param  {String}    name         - module name
   * @param  {Object}    options      - component options
   * @return {Undefined}
   */
  register(mod, name, options) {
    return this._registerNamespaced(mod, name, options);
  }

  /**
   * Register a module with the container
   * @param   {Object} params           - parameters
   * @param   {String} params.filename  - file name
   * @param   {String} params.namespace - container namespace
   * @param   {Object} params.options   - glob options
   * @return  {Function}
   * @private
   */
  _registerFile({ filename, namespace, options }) {
    const mod = require(`${options.cwd}/${filename}`); // eslint-disable-line
    if (!(typeof mod[namespace] === 'object' && !Array.isArray(mod[namespace]))) {
      throw new Error(`Invalid namespace declaration found for file: ${filename}`);
    }
    const opts = mod[namespace];
    if (mod[namespace]) {
      const name = opts.name || filename.replace(/\.[^/.]+$/, '');
      this._registerNamespaced(mod, name, opts);
    } else {
      debug(`No namespace found for component, skipping: ${filename}`);
    }
    return null;
  }

  /**
   * Register a given component for modules that declare themselves via the namespaced
   * declaration style
   * @param   {Object} mod     - module spec
   * @param   {Object} options - component options
   * @private
   */
  _registerNamespaced(mod, name, options) {
    defaults(options, this.options.defaults || {});
    let main = mod;
    if (mod.__esModule && mod.default) {
      main = mod.default;
    }
    const component = new Component({ mod: main, name, options });
    this.registry[component.name] = component;
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
      if (!PLUGIN.test(name) && !(this.registry[name] instanceof Component)) {
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
