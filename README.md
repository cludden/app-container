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

Define some simple modules with dependencies.
```javascript
// in config.js
import someAsyncModule from 'some-async-module'

export const inject = { }

export default async function() {
  const config = await someAsyncModule.load()
  return config
}

// in greet.js
export const inject = {
  require: ['config']
}

export default {
  greet(greeting, name) {
    console.log(`${greeting}, ${name}${this.config.punctuation}`);
  },
};

// in hello.js
export const inject = {
  require: ['greet']
}

export default function foo(greet) {
  return {
    sayHello(name) {
      greet.greet('Hello', name);
    },
  };
}
```

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
container.glob('**/*.js', { cwd: __dirname });

const hello = await container.load('hello')
hello.sayHello('World');
```


## Modules
Module's need to declare themselves to the container by exposing an object at a given namespace. If no namespace is defined when creating a container, the default namespace of `inject` will be used. The simplest module declaration is shown below.
```javascript
// in foo.js
export const inject = { };

export default function() {
  return {
    myMethod() { /* ... */ }
  };
};
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
export const inject = { type: 'constructor' };

export default class Foo {
  myMethod() { /* ... */ }
};
```

Or even a plain old javascript object.
```javascript
// in foo.js
export const inject = { };

export default {
  myMethod() { /* ... */ }
};
```

To declare a dependency, we can add a `require` property to our declaration. In the following example, we add a dependency on another component, `bar`. By the time our module's factory function is invoked, an instantiated bar instance will be passed in as an argument.
```javascript
// in foo.js
export const inject = {
  require: 'bar'
};

export default function(bar) {
  return {
    myMethod() { /* ... */ }
  };
};
```

A component can have more than one dependency as well. By declaring `require` as an array, each dependency will be created, initialized, and passed in as arguments to our factory function.
```javascript
// in foo.js
export const inject = {
  require: ['bar', 'baz', 'gar', 'gaz']
};

export default function(bar, baz, gar, gaz) {
  return {
    myMethod() { /* ... */ }
  };
};
```

We can also declare our dependencies as an object. This allows us to rename them, and/or group them in various ways.
```javascript
// in foo.js
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

export default function({ some, other, mods }) {
  const { gar, gaz } = mods;
  return {
    myMethod() { /* ... */ }
  };
};
```

Lastly, we can use special syntax to bulk load modules that match a pattern as an object.
```javascript
// in foo.js
export const inject = {
  require: ['all!^b', 'all!^g']
};

export default function({ bar, baz }, { gar, gaz }) {
  return {
    myMethod() { /* ... */ }
  };
};
```

Or, as an array.
```javascript
// in foo.js
export const inject = {
  require: ['any!^b', 'any!^g']
};

export default function([bar, baz], [gar, gaz]) {
  return {
    myMethod() { /* ... */ }
  };
};
```



## Asynchronous Components
The container supports asynchronous modules in two ways. 1) By returning a promise from a factory function:
```javascript
// in foo.js
export const inject = {
  require: ['bar', 'baz']
};

export default function(bar, baz) {
  return Promise.resolve({
    myMethod() { /* ... */ }
  });
};
```

or, 2) by exposing an initialization method/function on the module instance that returns a promise.
```javascript
// in foo.js
export const inject = {
  init: 'connect',
  require: ['bar', 'baz']
};

export default function(bar, baz) {
  return {
    myMethod() { /* ... */ },

    connect() {
      return Promise.resolve();
    },
  };
};
```



## Module Properties
A module declaration can declare any combination of the following properties.

### init <small>String</small>
The name of a method/function to call to initialize the module instance after it's been created.

### name <small>String</small>
A custom name to use to register with the container. If not provided, the relative path to the file (minus the extension) will be used instead when registering modules using glob

### require <small>Object|String|String[]</small>
Module dependencies.

### singleton <small>Boolean</small>
Whether or not the module should be treated as a singleton, meaning that if the module is required by two or more other modules, only one instance will ever be created, and all downstream modules will share the same instance.

### type <small>String</small>
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

###### Example
```javascript
// instantiate a new container using the default namespace and setting the default
// singleton flag to true
const container = new Container({
  namespace: 'inject',
  defaults: {
    singleton: true,
  },
})
```

---

### glob(pattern, options)
The glob method allows for automagically registering multiple modules with the container instance using `glob` to match files in a given directory.

###### Parameters
| Name | Type | Description |
| --- | --- | --- |
| pattern | *String* | a glob pattern for matching modules to register with the container. Only modules that match this pattern and declare a matching namespace will be registered. |
| options | *Object* | an options object to pass to the underlying `glob.sync` call. |

###### Example
```javascript
// recursively register all .js files in the same directory as this file
// excluding index.js. see glob.js for more options
const container = new Container()
container.glob('**/*.js', { cwd: __dirname, ignore: ['index.js'] })
```

---

### load(...components) => Bluebird
Load one or more components

###### Parameters
| Name | Type | Description |
| --- | --- | --- |
| component | *Object|String* | one or more components to load |

###### Example
```javascript
// load a single module
const foo = await container.load('foo')

// load multiple modules
const [foo, bar] = container.load('foo', 'bar')

// the container returns a bluebird promise, so any bluebird function can be used.
container.load('foo', 'bar')
.spread((foo, bar) => {
  // ..
});

// use a component map
const { foo, bar} = await container.load({ foo: 'services/foo', bar: 'services/bar' })

// use all or any
const { 'services/foo': foo, 'services/bar': bar } = await container.load('all!^services')

const [foo] = await container.load('any!^services')
```



## Debugging
To enable debugging, you can use the `DEBUG` environment variable.
```shell
$ export DEBUG=app-container*
```



## Testing
run the test suite with code coverage
```shell
$ docker-compose run app-container
```



## Contributing
1. [Fork it](https://github.com/cludden/app-container/fork)
1. Create your feature branch (`git checkout -b my-new-feature`)
1. Commit your changes using [conventional changelog standards](https://github.com/bcoe/conventional-changelog-standard/blob/master/convention.md) (`git commit -am 'feat: adds my new feature'`)
1. Push to the branch (`git push origin my-new-feature`)
1. Ensure linting/security/tests are all passing
1. Create new Pull Request



## LICENSE
Copyright (c) 2017 Chris Ludden.  
Licensed under the [MIT License](LICENSE.md)
