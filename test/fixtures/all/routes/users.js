
export const ioc = {
  require: ['all!^middleware*'],
};

export default function (middleware) {
  return {
    getMiddleware() {
      return middleware;
    },
  };
}
