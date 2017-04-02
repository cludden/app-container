
export default function d({ b }) {
  function bar() {
    return b.doSomethingElse();
  }

  return {
    bar,
  };
}

export function inject(register) {
  register(d, { require: { b: 'b' } });
}
