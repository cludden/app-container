
export class C {
  constructor(a) {
    this.a = a;
  }
}

export default function (register) {
  register(C, {
    require: 'a',
    singleton: true,
    type: 'constructor',
  });
}
