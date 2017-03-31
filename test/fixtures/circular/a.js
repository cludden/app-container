
export class A {
  constructor(b) {
    this.b = b;
  }
}

export default function (register) {
  register(A, {
    require: 'b',
    singleton: true,
    type: 'constructor',
  });
}
