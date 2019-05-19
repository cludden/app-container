FROM node:10

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app
WORKDIR $HOME/src

COPY package.json package-lock.json $HOME/src/
RUN chown -R app:app $HOME/*
USER app
RUN npm install
USER root
COPY . $HOME/src
RUN chown -R app:app $HOME/*
USER app

CMD npm run coverage
