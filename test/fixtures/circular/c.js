
export default class C {
  constructor(a) {
    this.a = a;
  }
}

export const ioc = {
  require: 'a',
  singleton: true,
  type: 'constructor',
};
