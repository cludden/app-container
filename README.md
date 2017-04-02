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
  namespace: 'inject',
  defaults: { singleton: true },
});

// register modules matching a given pattern
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

## API
*coming soon...*

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
