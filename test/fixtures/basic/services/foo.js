
export class Foo {
  constructor(config, bar) {
    this.config = config;
    this.bar = bar;
    this.initialized = false;
  }

  initialize() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.initialized = true;
        resolve();
      }, 10);
    });
  }
}

export default function (register) {
  register(Foo, {
    singleton: true,
    init: 'initialize',
    type: 'constructor',
    require: ['services/config', 'services/bar'],
  });
}
