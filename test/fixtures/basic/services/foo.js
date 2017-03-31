
export class Foo {
  constructor(config, bar) {
    this.config = config;
    this.bar = bar;
    this.initialized = false;
  }
}

export default function (register) {
  register(Foo, {
    singleton: true,
    type: 'constructor',
    require: ['services/config', 'services/bar'],
  });
}
