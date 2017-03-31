
export class User {
  constructor() {
    this.models = [];
  }
  create(user) {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.models.push(user);
        resolve(user);
      }, 10);
    });
  }
}

export default function (register) {
  register(User, {
    singleton: true,
    type: 'constructor',
  });
}
