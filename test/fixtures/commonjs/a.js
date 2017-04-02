
module.exports = {
  foo(n) {
    return this.b.bar() + n;
  },

  ioc(register) {
    register(this, {
      name: 'aService',
      require: { b: 'bService' },
    });
  },
};
