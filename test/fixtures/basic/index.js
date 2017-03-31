
import Container from '../../../lib/container';

const container = new Container('{services,controllers}/**/*.js', { cwd: __dirname });

export default container;
