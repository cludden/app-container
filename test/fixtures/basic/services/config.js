

export function factory({ other, bar }) {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve({ message: 'Hello World!' });
    }, 10);
  });
}

export default function (register) {
  register(factory, {
    require: {
      other: 'services/other',
      bar: 'services/bar',
    },
  });
}
