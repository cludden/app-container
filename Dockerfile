FROM node:6

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app
WORKDIR $HOME/src

COPY package.json npm-shrinkwrap.json $HOME/src/
RUN chown -R app:app $HOME/*
USER app
RUN npm install
USER root
COPY . $HOME/src
RUN chown -R app:app $HOME/*
USER app

CMD npm run coverage
