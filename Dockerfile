FROM node:12.19.0-alpine

RUN apk update \
  && apk upgrade \
  && apk add postgresql-client \
  && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production

COPY . .
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000
ENTRYPOINT [ "npm", "start" ]
