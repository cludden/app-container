
export default function (models) {
  return async function (ctx) {
    ctx.models = models;
    ctx.c = true;
    return ctx;
  };
}

export const ioc = {
  require: ['all!.*/model'],
};
