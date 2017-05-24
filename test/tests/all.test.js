import Bluebird from 'bluebird';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import path from 'path';

import Container from '../../lib/container';

const options = { namespace: 'ioc', defaults: { singleton: true } };

describe('[all]', function () {
  it('should load {all!}', function () {
    const container = new Container(options);
    container.glob('**/*.js', {
      dir: path.join(__dirname, '../fixtures/all'),
    });
    return container.load('all!.*/model')
    .then((models) => {
      expect(models).to.be.an('object');
      expect(models).to.have.all.keys('users/model', 'comments/model');
    })
    .then(() => container.load('all!^middleware/.*'))
    .then((middleware) => {
      expect(middleware).to.be.an('object');
      expect(middleware).to.have.all.keys('middleware/a', 'middleware/b', 'middleware/c');
    })
    .then(() => container.load('routes/users'))
    .then((users) => {
      expect(users.getMiddleware()).to.be.an('object');
    });
  });
});

describe('[any]', function () {
  it('should load {any!}', async function () {
    const container = new Container(options);
    container.glob('**/*.js', {
      dir: path.join(__dirname, '../fixtures/all'),
    });
    const models = await container.load('any!.*/model');
    expect(models).to.be.an('array').with.lengthOf(2);
    const middleware = await container.load('any!^middleware/.*');
    expect(middleware).to.be.an('array').with.lengthOf(3);
    const result = await Bluebird.reduce(middleware, (memo, fn) => fn(memo), {});
    expect(result).to.be.an('object');
    expect(result).to.have.all.keys('a', 'b', 'c', 'models');
  });
});
