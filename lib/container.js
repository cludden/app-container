import Bluebird from 'bluebird';
import createDebug from 'debug';
import { DepGraph } from 'dependency-graph';
import glob from 'glob';
import { set } from 'lodash';

import Component from './component';

const debug = createDebug('iocontainer');

export default class Container {
  constructor(defaults = {}) {
    this._defaults = defaults;
  }

  glob(pattern, options) {
    if (!options.dir) {
      throw new Error('Missing required \'dir\' option');
    }
    const opts = Object.assign({}, options, { cwd: options.dir });
    const filenames = glob.sync(pattern, opts);
    this.registry = {};
    filenames.forEach((filename) => {
      const register = this._register(filename);
      let mod = require(`${opts.dir}/${filename}`); // eslint-disable-line
      if (mod.__esModule && mod.default) {
        mod = mod.default;
      }
      mod(register);
    });
    this._validateDependencyGraph();
  }

  load(...components) {
    return Bluebird.try(() => {
      if (components.length === 1 && typeof components[0] === 'string') {
        return this._load(components[0]);
      } else if (components.length === 1 && typeof components[0] === 'object') {
        return this._loadRecursive(components[0]);
      } else if (Array.isArray(components)) {
        return Bluebird.map(components, name => this._load(name));
      }
      throw new Error('Invalid load signature');
    });
  }

  _load(name) {
    return Bluebird.try(() => {
      const component = this.registry[name];
      if (!component) {
        throw new Error(`Unknown Component: ${name}`);
      }
      return component.load(this);
    });
  }

  _loadRecursive(map, accum = {}) {
    return loadRecursive(this, map, accum);
  }

  _register(filename) {
    return (mod, options = {}) => {
      const component = new Component({ filename, mod, options });
      debug(`registering component: ${component.name}`);
      this.registry[component.name] = component;
    };
  }

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
            if (!graph.hasNode(dep)) {
              graph.addNode(dep);
            }
            graph.addDependency(name, dep);
          });
        } else if (typeof options.require === 'object') {
          recursiveDeps(graph, name, options.require);
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

function loadRecursive(container, map, accum = {}) {
  return Bluebird.reduce(Object.keys(map), (memo, key) => {
    const path = map[key];
    if (typeof path === 'string') {
      return container._load(path)
      .then((mod) => {
        set(memo, key, mod);
        return memo;
      });
    }
    return loadRecursive(container, path)
    .then((mods) => {
      set(memo, key, mods);
      return memo;
    });
  }, accum);
}

function recursiveDeps(graph, name, deps) {
  return Object.keys(deps).forEach((key) => {
    const dep = deps[key];
    if (typeof dep === 'string') {
      if (!graph.hasNode(dep)) {
        graph.addNode(dep);
      }
      graph.addDependency(name, dep);
    } else if (typeof dep === 'object') {
      recursiveDeps(graph, name, deps[dep]);
    }
  });
}
