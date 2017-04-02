
import Container from '../../../lib/container';

const container = new Container();
container.glob('**/*.js', { dir: __dirname });

export default container;
