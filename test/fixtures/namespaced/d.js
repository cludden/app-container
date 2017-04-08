
export default function d({ b }) {
  function bar() {
    return b.doSomethingElse();
  }

  return {
    bar,
  };
}

export const inject = { require: { b: 'b' } };
