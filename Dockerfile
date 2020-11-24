FROM node:12.19.0-alpine

RUN apk update \
  && apk upgrade \
  && apk add postgresql-client \
  && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN chown -R node:node /usr/src/app
USER node

EXPOSE 3000

# Script that will ensure db create and db migrate is run before we attempt to
# run our app. This should ensure the container runs successfully the first
# time it's created, and everytime after that.
ENTRYPOINT [ "./entrypoint.sh" ]

# This is the default cmd that will be run if an alternate is not passed in at
# the command line.
# Use the "exec" form of CMD so node shuts down gracefully on SIGTERM
# (i.e. `docker stop`)
CMD [ "npm", "start" ]
