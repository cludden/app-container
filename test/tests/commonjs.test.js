import chai, { expect } from 'chai';
import { afterEach, before, describe, it } from 'mocha';
import path from 'path';
import sinon from 'sinon';
import sinonchai from 'sinon-chai';

import Container from '../../lib/container';

chai.use(sinonchai);

describe('[commonjs]', function () {
  before(function () {
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('should support common.js', async function () {
    const container = new Container({
      namespace: 'ioc',
      defaults: { singleton: true },
    });
    container.glob('*.js', {
      dir: path.join(__dirname, '../fixtures/commonjs'),
    });
    const [a, b, c] = await container.load('aService', 'bService', 'cService');
    expect(a).to.have.property('foo').that.is.a('function');
    expect(b).to.have.property('bar').that.is.a('function');
    expect(c).to.have.property('seed').that.is.a('function');
    this.sandbox.spy(b, 'bar');
    this.sandbox.spy(c, 'seed');
    expect(a.foo(5)).to.equal(6);
    expect(b.bar).to.have.callCount(1);
    expect(c.seed).to.have.callCount(1);
  });
});
