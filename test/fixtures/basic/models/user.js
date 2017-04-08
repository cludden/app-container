
export default class User {
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

export const inject = {
  singleton: true,
  type: 'constructor',
};
