import { expect } from 'chai';
import { describe, it } from 'mocha';

import Container from '../../lib/container';
import * as amod from '../fixtures/namespaced/a';
import * as bmod from '../fixtures/namespaced/b';
import * as dmod from '../fixtures/namespaced/d';

describe('manual', function () {
  it('should allow components to be registered manually', async function () {
    const container = new Container({
      namespace: 'inject',
      defaults: { singleton: true },
    });
    container.register(amod, 'a', amod.inject);
    container.register(bmod, 'b', bmod.inject);
    container.register(dmod, 'd', dmod.inject);
    const [a, b, d] = await container.load(['a', 'b', 'd']);
    expect(a).to.have.property('doSomething');
    expect(b).to.have.property('doSomethingElse');
    expect(d).to.have.property('bar');
  });
});
