FROM node
RUN mkdir /app
RUN chown -R node:node /app
COPY --chown=node:node . /app

USER node
WORKDIR /app
RUN npm i
ENTRYPOINT ./docker-entrypoint.sh
