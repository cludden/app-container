import Bluebird from 'bluebird';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import path from 'path';

import Container from '../../lib/container';

const options = { namespace: 'ioc', defaults: { singleton: true } };

describe('[plugins]', function () {
  describe('[all!]', function () {
    it('should load {all!}', function () {
      const container = new Container(options);
      container.glob('**/*.js', {
        cwd: path.join(__dirname, '../fixtures/all'),
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

  describe('[any!]', function () {
    it('should load {any!}', async function () {
      const container = new Container(options);
      container.glob('**/*.js', {
        cwd: path.join(__dirname, '../fixtures/all'),
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

  describe('[any! any!]', function () {
    it('should load multiple plugins', async function () {
      const container = new Container(options);
      container.glob('**/*.js', {
        cwd: path.join(__dirname, '../fixtures/all'),
      });
      const app = await container.load('app');
      expect(app).to.have.property('services').that.is.an('array').with.lengthOf(0);
      expect(app).to.have.property('routes').that.is.an('array').with.lengthOf(1);
      expect(app).to.have.property('middleware').that.is.an('array').with.lengthOf(3);
    });
  });

  describe('[container!]', function () {
    it('should load {container!}', async function () {
      // define new container
      const container = new Container(options);
      container.glob('**/*.js', {
        cwd: path.join(__dirname, '../fixtures/all'),
      });

      // register a dynamic component
      container.register(async function (c) {
        expect(c).to.deep.equal(container);
        return c.load('users/model');
      }, 'dynamic', {
        require: ['container!'],
      });

      const [u1, u2] = await container.load('users/model', 'dynamic');
      expect(u1).to.deep.equal(u2);
    });
  });
});
