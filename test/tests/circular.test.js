import { expect } from 'chai';
import { describe, it } from 'mocha';
import path from 'path';

import Container from '../../lib/container';

describe('[basic]', function () {
  it('should load {string}', function () {
    console.log(path.join(__dirname, '../fixtures/circular'));
    const createContainer = () => {
      const container = new Container();
      container.glob('{a,b,c}.js', {
        cwd: path.join(__dirname, '../fixtures/circular'),
      });
      return container;
    };
    expect(createContainer).to.throw(Error);
  });
});
