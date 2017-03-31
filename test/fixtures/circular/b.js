
export class B {
  constructor(c) {
    this.c = c;
  }
}

export default function (register) {
  register(B, {
    require: 'c',
    singleton: true,
    type: 'constructor',
  });
}
