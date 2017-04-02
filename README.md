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
In order to utilize the container, we first need a way for modules to declare some basic information about themselves (what are their dependencies? what are they called? do they require initialization? should they be treated as singletons?). Below we declare a simple module `fooService` that has a dependency on `barService`. There are two distinct styles of declaring modules to the container; an example of each is show below.

**function**
```javascript
// in foo.js

export 
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
