import c from './c';

export default {
  n: 0,
  doSomethingElse() {
    return c.foo(this.n);
  },
  init() {
    this.n += 1;
  },
};

export const inject = {
  init: 'init',
};
