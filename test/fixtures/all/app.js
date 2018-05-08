
export const ioc = {
  name: 'app',
  require: ['any!services/.+', 'any!routes/.+', 'any!middleware/.+'],
};

export default function (services, routes, middleware) {
  return {
    services,
    routes,
    middleware,
  };
}
