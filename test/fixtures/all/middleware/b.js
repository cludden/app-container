
export default async function (ctx) {
  ctx.b = true;
  return ctx;
}

export const ioc = { type: 'object' };
