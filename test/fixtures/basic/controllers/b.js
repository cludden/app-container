
export default function ({ config, foo }) {
  return { config, foo };
}

export const inject = {
  require: {
    config: 'services/config',
    foo: 'services/foo',
  },
};
