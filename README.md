# app-container
Yet another IoC container for node applications, built from the ground up with async components in mind.

## Installing
```shell
$ npm install --save app-container
```

## Getting Started
config.js
```javascript
export function config() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ n: 4 });
    }, 10);
  });
}

export default function(register) {
  register(config);
}
```

bar.js
```javascript
export class Bar {
  constructor(config) {
    this.n = config.n;
  }

  add(n) {
    this.n += n;
    return this.n;
  }
}

export default function(register) {
  register(Bar, {
    require: 'config',
    type: 'constructor',
  });
}
```

foo.js
```javascript
export function fooFactory(config, bar) {
  let base;

  function add2toBasePlusBar() {
    return bar.add(2);
  }

  function initialize() {
    return new Promise((resolve) => {
      setTimeout(() => {
        base = config.n;
        resolve();
      });
    });
  }

  return {
    add2toBasePlusBar,
    initialize,
  };
}

export default function(register) {
  register(fooFactory, { require: ['config', 'bar'] });
}
```

container.js
```javascript
import Container from 'app-container';

// create a new container and register your components
const container = new Container();
container.glob('{bar,config,foo}.js', { dir: __dirname });

container.load('foo')
.then((foo) => {
  foo.add2toBasePlusBar();
});
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
