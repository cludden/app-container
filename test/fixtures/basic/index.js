
import Container from '../../../lib/container';

const container = new Container();
container.glob('{controllers,models,services}/**/*.js', { dir: __dirname });

export default container;
