import Bluebird from 'bluebird';

export default class Group {
  constructor({ userModel }) {
    this.userModel = userModel;
    this.models = [];
  }

  create({ users }) {
    return Bluebird.each(users, user => this.userModel.create(user))
    .then(() => {
      this.models.push({ users });
    });
  }
}

export const inject = {
  require: { userModel: 'models/user' },
  singleton: true,
  type: 'constructor',
};
