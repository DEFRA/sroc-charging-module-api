FROM node:12.19.0-alpine

# Set our node environment. Defaults to production, though our docker-compose overrides this to development on build and
# run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Set port to use. Default to port 3000 for node, and 9229 and 9230 (tests) to support debugging from vscode. Our
# docker-compose.yml overrides this to 3003 to avoid clashes with other environments
ARG PORT=3000
ENV PORT $PORT
EXPOSE $PORT 9229 9230

# Ensure we have updated whatever packages come as part of the alpine image before we start using it. This was a
# requirement following PEN testing. We also add the dependencies we need to support using PostgreSQL. Finish with
# clearing the cache created during this to keep the image as small as possible (using Docker we can't benefit from
# using the cache)
RUN apk update \
  && apk upgrade \
  && apk add postgresql-client \
  && rm -rf /var/cache/apk/*

# Get the latest version of npm at time of build, regardless of node version, for speed and fixes.
RUN npm i npm@latest -g

# We have chosen /home/node as our working directory to be consistent with https://github.com/DEFRA/defra-docker-node
WORKDIR /home/node

# The official node image provides an unprivileged user as a security best practice, But we have to manually enable it.
# We put it here so npm installs dependencies as the same user who runs the app.
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md#non-root-user
USER node

# Install dependencies first, in a different location for easier app bind mounting for local development. To do this we
# first copy just the package*.json files from the host
COPY package.json package-lock.json* ./
# Then install the dependencies. We don't have any optional dependencies. But this makes verbose we don't want them
# installed in this context
RUN npm install --no-optional
# Update the PATH env var to add any node binaries from our dependencies to it. This should make them discoverable from
# the command line
ENV PATH /home/node/node_modules/.bin:$PATH

# Set the working directory up a level from node_modules to avoid conflicts with node_modules on the host
WORKDIR /home/node/app

# Copy in our source code last, as it changes the most and this improves build speeds
COPY . .

# This is the default cmd that will be run if an alternate is not passed in at the command line.
# Use the "exec" form of CMD to help node shut down gracefully on SIGTERM (i.e. `docker stop`)
#
# We call node directly as advised in https://www.docker.com/blog/keep-nodejs-rockin-in-docker/ (which is the main
# inspiration for most of this Dockerfile!) This is all to do with how the app stops gracefully when the container is
# dropped/stopped. For example, we don't want the app to just drop all existing connections when we apply an update in
# production.
#
# We've not properly checkec whether we support a graceful shutdown yet. But this at least ensures we are starting with
# the right command!
CMD [ "node", "server.js" ]
