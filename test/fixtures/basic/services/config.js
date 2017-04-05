

export default function factory() {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve({ message: 'Hello World!' });
    }, 10);
  });
}

export const inject = { };
