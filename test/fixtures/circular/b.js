
export default class B {
  constructor(c) {
    this.c = c;
  }
}

export const ioc = {
  require: 'c',
  singleton: true,
  type: 'constructor',
};
