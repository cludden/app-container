

export default function (register) {
  register(function ({ config, foo }) {
    return { config, foo };
  }, {
    require: {
      config: 'services/config',
      foo: 'services/foo',
    },
  });
}
