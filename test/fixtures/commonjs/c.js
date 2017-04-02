
module.exports = function () {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        seed: () => 1,
      });
    }, 10);
  });
};

module.exports.ioc = {
  name: 'cService',
};
