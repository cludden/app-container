import chai, { expect } from 'chai';
import { afterEach, before, describe, it } from 'mocha';
import path from 'path';
import sinon from 'sinon';
import sinonchai from 'sinon-chai';

import Container from '../../lib/container';

chai.use(sinonchai);

describe('[namespace]', function () {
  before(function () {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('should support namespaced', async function () {
    const container = new Container({
      namespace: 'inject',
      defaults: { singleton: true },
    });
    container.glob('*.js', {
      cwd: path.join(__dirname, '../fixtures/namespaced'),
    });
    const a = await container.load('a');
    expect(a).to.have.property('doSomething').that.is.a('function');
    expect(a).to.have.property('b');
    const b = await container.load('b');
    expect(a.b).to.equal(b);
    const d = await container.load('d');
    this.sandbox.spy(b, 'doSomethingElse');
    d.bar();
    expect(b.doSomethingElse).to.have.callCount(1);
  });
});
