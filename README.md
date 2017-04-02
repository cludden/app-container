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
Create a new container.
```javascript
import Container from 'app-container';

// create a new container
const container = new Container()

// define locations for the container to inspect
container.glob('**/*.js', { dir: __dirname });
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
