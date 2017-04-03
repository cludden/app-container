
export default async function (ctx) {
  ctx.a = true;
  return ctx;
}

export const ioc = { type: 'object' };
