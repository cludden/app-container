import Bluebird from 'bluebird';
import createDebug from 'debug';
import { DepGraph } from 'dependency-graph';
import glob from 'glob';
import { set } from 'lodash';

import Component from './component';

const debug = createDebug('iocontainer');

export default class Container {
  constructor(pattern, options) {
    this.options = options;
    const filenames = glob.sync(pattern, options);
    this.registry = {};
    filenames.forEach((filename) => {
      const register = this.register(filename);
      let mod = require(`${this.options.cwd}/${filename}`); // eslint-disable-line
      if (mod.__esModule && mod.default) {
        mod = mod.default;
      }
      mod(register);
    });
  }

  buildDependencyGraph() {
    const graph = new DepGraph();
    Object.keys(this.registry).forEach((name) => {
      const { options } = this.registry[name];
      graph.addNode(name);
      if (options.require) {
        if (Array.isArray(options.require)) {
          options.require.forEach((dep) => {
            if (!graph.hasNode(dep)) {
              graph.addNode(dep);
            }
            graph.addDependency(name, dep);
          });
        }
      }
    });
    return graph;
  }

  load(components) {
    return Bluebird.try(() => {
      if (typeof components === 'string') {
        return this._load(components);
      } else if (Array.isArray(components)) {
        return Bluebird.map(components, name => this._load(name));
      } else if (typeof components === 'object') {
        return this._loadRecursive(components);
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
    return Bluebird.reduce(Object.keys(map), (memo, key) => {
      const path = map[key];
      if (typeof path === 'string') {
        return this._load(path)
        .then((mod) => {
          set(memo, key, mod);
          return memo;
        });
      }
      return this._loadRecursive(path)
      .then((mods) => {
        set(memo, key, mods);
        return memo;
      });
    }, accum);
  }

  register(filename) {
    return (mod, options = {}) => {
      const component = new Component({ filename, mod, options });
      debug(`registering component: ${component.name}`);
      this.registry[component.name] = component;
    };
  }
}
