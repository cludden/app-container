# app-container
Yet another IoC container for node applications with a few specific goals:
- support for asynchronous modules
- flexible declaration & dependency syntax
- support for initialization hooks



## Installing
```shell
$ npm install --save app-container
```



## Getting Started
Below is a super simple example. See `/test/fixtures` for some more examples.  

Create a new container.
```javascript
// in index.js
import Container from 'app-container';

// create a new container
const container = new Container({
  namespace: 'inject', // this is the default namespace
  defaults: { singleton: true }, // these are defaults to apply to all module declarations
});

// register modules matching a given pattern. the directory will be scanned recursively.
container.glob('**/*.js', { dir: __dirname });

container.load('hello')
.then((hello) => {
  hello.sayHello('World');
});
```

Define one or more modules.
```javascript
// in hello.js
export default function foo(greet) {
  return {
    sayHello(name) {
      greet.greet('Hello', name);
    },
  };
}

export const inject = { require: ['greet'] }
```
```javascript
// in greet.js
export default {
  greet(greeting, name) {
    console.log(`${greeting}, ${name}${this.config.punctuation}`);
  },
};

export const inject = { require: ['config'] }
```
```javascript
// in config.js
export default class Config {
  initialize() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.punctuation = '!';
        resolve();
      }, 10);
    });
  }
}

export const inject = {
  init: 'initialize',
  type: 'constructor',
}
```



## Modules
Module's need to declare themselves to the container by exposing an object at a given namespace. If no namespace is defined when creating a container, the default namespace of `inject` will be used. The simplest module declaration is shown below.
```javascript
// in foo.js
export default function() {
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = { };
```

Or, in commonjs format:
```javascript
// in foo.js
module.exports = function() {
  return {
    myMethod() { /* ... */ }
  };
};

module.exports.inject = { };
```

If `foo.js` resides at the root of one of our registered directories, then the container would register a new component named `foo` with no dependencies and assume that `foo`'s default export (or module.exports) is a factory function. We could instead declare `foo` as a constructor function like so:
```javascript
// in foo.js
export default class Foo {
  myMethod() { /* ... */ }
};

export const inject = { type: 'constructor' };
```

Or even a plain old javascript object.
```javascript
// in foo.js
export default {
  myMethod() { /* ... */ }
};

export const inject = { };
```

To declare a dependency, we can add a `require` property to our declaration. In the following example, we add a dependency on another component, `bar`. By the time our module's factory function is invoked, an instantiated bar instance will be passed in as an argument.
```javascript
// in foo.js
export default function(bar) {
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = {
  require: 'bar'
};
```

A component can have more than one dependency as well. By declaring `require` as an array, each dependency will be created, initialized, and passed in as arguments to our factory function.
```javascript
// in foo.js
export default function(bar, baz, gar, gaz) {
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = {
  require: ['bar', 'baz', 'gar', 'gaz']
};
```

We can also declare our dependencies as an object. This allows us to rename them, and/or group them in various ways.
```javascript
// in foo.js
export default function({ some, other, mods }) {
  const { gar, gaz } = mods;
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = {
  require: {
    some: 'bar',
    other: 'baz',
    mods: {
      gar: 'gar',
      gaz: 'gaz'
    }
  },
};
```

Lastly, we can use special syntax to bulk load modules that match a pattern as an object.
```javascript
// in foo.js
export default function({ bar, baz }, { gar, gaz }) {
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = {
  require: ['all!^b', 'all!^g']
};
```

Or, as an array.
```javascript
// in foo.js
export default function([bar, baz], [gar, gaz]) {
  return {
    myMethod() { /* ... */ }
  };
};

export const inject = {
  require: ['any!^b', 'any!^g']
};
```



## Asynchronous Components
The container supports asynchronous modules in two ways. 1) By returning a promise from a factory function:
```javascript
// in foo.js
export default function(bar, baz) {
  return Promise.resolve({
    myMethod() { /* ... */ }
  });
};

export const inject = {
  require: ['bar', 'baz']
};
```

or, 2) by exposing an initialization method/function on the module instance that returns a promise.
```javascript
// in foo.js
export default function(bar, baz) {
  return {
    myMethod() { /* ... */ },

    connect() {
      return Promise.resolve();
    },
  };
};

export const inject = {
  init: 'connect',
  require: ['bar', 'baz']
};
```



## Module Properties
### init (String)
The name of a method/function to call to initialize the module instance after it's been created.

### name (String)
A custom name to use to register with the container. If not provided, the relative path to the file (minus the extension) will be used instead.

### require (Object|String|String[])
Module dependencies.

### singleton (Boolean)
Whether or not the module should be treated as a singleton, meaning that if the module is required by two or more other modules, only one instance will ever be created, and all downstream modules will share the same instance.

### type (String)
The default export (or module.exports) should either be a factory function, constructor function or something like a plain old javascript object or function that doesn't need instantiation/initialization. If no type is declared, the container will inspect it and assume that it is a factory function (if a function is exported), or an object, if something else is exported. You can override the default behavior by declaring a type property with a value of `constructor` or `object`.



## API
### Container([options]) => container
Constructor function for creating container instances.

###### Parameters
| Name | Type | Description |
| --- | --- | --- |
| options | *Object* | |
| options.defaults | *Object* | a map of default module options to apply to each module declaration |
| options.namespace | *String* | override the default namespace `inject` |

---

### glob(pattern, options)
Scan a given directory recursively and register valid modules matching the provided pattern with the container

###### Parameters
| Name | Type | Description |
| --- | --- | --- |
| pattern | *String* | a glob pattern for matching modules to register with the container. Only modules that match this pattern and declare a matching namespace will be registered. |
| options | *Object* | an options object to pass to the underlying `glob.sync` call. |
| options.dir | *String* | the top level directory to scan |

---

### load(...components) => Bluebird
Load one or more components

###### Parameters
| Name | Type | Description |
| --- | --- | --- |
| component | *Object|String* | one or more components to load |

###### Examples`
```javascript
// load a single module
container.load('foo')
.then(foo => {
  // ..
});

// load multiple modules
container.load('foo', 'bar')
.then(([foo, bar]) => {
  // ..
});

// the container returns a bluebird promise, so any bluebird function can be used.
container.load('foo', 'bar')
.spread((foo, bar) => {
  // ..
});

// use a component map
container.load({ foo: 'services/foo', bar: 'services/bar' })
.then(({ foo, bar}) => {
  // ..
});

// use all or any
container.load('all!^services')
.then(({ 'services/foo': foo, 'services/bar': bar }) => {
  // ..
});

container.load('any!^services')
.spread(([foo]))
```



## Testing
run the test suite
```shell
$ npm test
```

run code coverage
```shell
$ npm run coverage
```



## Contributing
1. [Fork it](https://github.com/cludden/app-container/fork)
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request



## LICENSE
Copyright (c) 2017 Chris Ludden.  
Licensed under the [MIT License](LICENSE.md)
