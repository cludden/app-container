import { expect } from 'chai';
import { describe, it } from 'mocha';

import container from '../fixtures/basic';

describe('[basic]', function () {
  it('should load {string}', function () {
    return container.load('services/foo')
    .then((foo) => {
      expect(foo).to.have.property('initialized');
    });
  });
});
