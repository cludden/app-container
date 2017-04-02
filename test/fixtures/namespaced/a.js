

export default {
  doSomething() {
    return this.b.doSomethingElse();
  },
};

export const inject = {
  require: {
    b: 'b',
  },
};
