
module.exports = function (c) {
  return {
    bar() {
      return c.seed();
    },
  };
};

module.exports.ioc = {
  name: 'bService',
  require: ['cService'],
};
