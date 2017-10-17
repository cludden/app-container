import { expect } from 'chai';
import { describe, it } from 'mocha';
import path from 'path';

import Container from '../../lib/container';

describe('[circular]', function () {
  it('should error on circular dependencies', function () {
    const createContainer = () => {
      const container = new Container({ namespace: 'ioc' });
      container.glob('{a,b,c}.js', {
        cwd: path.join(__dirname, '../fixtures/circular'),
      });
      return container;
    };
    expect(createContainer).to.throw(Error);
  });
});
