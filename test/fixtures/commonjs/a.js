
module.exports = {
  foo(n) {
    return this.b.bar() + n;
  },

  ioc: {
    name: 'aService',
    require: { b: 'bService' },
  },
};
