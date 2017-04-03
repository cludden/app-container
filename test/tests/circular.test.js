import { expect } from 'chai';
import { describe, it } from 'mocha';
import path from 'path';

import Container from '../../lib/container';

describe('[basic]', function () {
  it('should load {string}', function () {
    const createContainer = () => {
      const container = new Container();
      container.glob('{a,b,c}.js', {
        dir: path.join(__dirname, '../fixtures/circular'),
      });
      return container;
    };
    expect(createContainer).to.throw(Error);
  });
});
