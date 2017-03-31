
import Container from './container';

const container = new Container('{services,controllers}/**/*.js', { cwd: __dirname });

container.load()
.then((...args) => {
  console.log(...args);
});
