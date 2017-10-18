import chai, { expect } from 'chai';
import { afterEach, before, describe, it } from 'mocha';
import path from 'path';
import sinon from 'sinon';
import sinonchai from 'sinon-chai';

import Container from '../../lib';

chai.use(sinonchai);

describe('[basic]', function () {
  before(function () {
    this.container = new Container({ namespace: 'inject' });
    this.container.glob('**/*.js', {
      cwd: path.join(__dirname, '../fixtures/basic'),
    });
    this.sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    this.sandbox.restore();
  });

  it('should load {string}', function () {
    return this.container.load('services/foo')
    .then((foo) => {
      expect(foo).to.have.property('bar');
      expect(foo.bar).to.have.property('baz', 'bar');
      expect(foo).to.have.property('config');
      expect(foo.config).to.have.property('message');
      expect(foo).to.have.property('initialized', true);
    });
  });

  it('should load {multiple}', function () {
    return this.container.load('controllers/a', 'controllers/b')
    .spread((a, b) => {
      expect(a).to.have.property('foo');
      expect(b).to.have.property('foo');
      expect(a.foo).to.equal(b.foo);
      expect(a).to.have.property('config');
      expect(b).to.have.property('config');
      expect(a.config).to.not.equal(b.config);
    });
  });

  it('should load {object}', function () {
    return this.container.load({
      foo: 'services/foo',
      models: {
        group: 'models/group',
        user: 'models/user',
      },
    })
    .then((result) => {
      expect(result).to.be.an('object');
      expect(result).to.have.property('foo');
      expect(result.foo).to.have.property('bar');
      expect(result).to.have.property('models');
      expect(result.models).to.be.an('object');
      expect(result.models).to.have.property('group');
      expect(result.models).to.have.property('user');
      expect(result.models.group.userModel).to.equal(result.models.user);
      this.sandbox.spy(result.models.user, 'create');
      return result.models.group.create({
        users: [{ name: 'Bob' }, { name: 'Alice' }],
      }).then(() => result);
    })
    .then((result) => {
      expect(result.models.user.create).to.have.callCount(2);
    });
  });
});
