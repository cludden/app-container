
export default {
  addComment(id, comment) {
    this.comments.create({ user: id, comment });
  },
};

export const ioc = { require: { comments: 'comments/model' } };
