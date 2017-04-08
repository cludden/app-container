
export default class A {
  constructor(b) {
    this.b = b;
  }
}

export const ioc = {
  require: 'b',
  singleton: true,
  type: 'constructor',
};
