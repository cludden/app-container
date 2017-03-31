import Bluebird from 'bluebird';

export class Group {
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

export default function (register) {
  register(Group, {
    require: { userModel: 'models/user' },
    singleton: true,
    type: 'constructor',
  });
}
