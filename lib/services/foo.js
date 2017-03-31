
class Foo {
  constructor(bar) {
    this.bar = bar;
    this.initialized = false;
  }
}

export default function (register) {
  register(Foo, {
    singleton: true,
    type: 'constructor',
    require: ['services/bar'],
  });
}
