# Dockerhub Hooks

As part of supporting users of the API we are provide access to Docker images via [DockerHub](https://hub.docker.com/repository/docker/environmentagency/sroc-charging-module-api). To ensure what is on DockerHub reflects the latest changes we have enabled [automated builds](https://docs.docker.com/docker-hub/builds/).

This folder and the files in it are specific to supporting building on DockerHub.

We need the current git commit hash and image name as build args. This means  we need to override the default `docker build` used by DockerHub.

The mechanism for doing this is [hooks](https://docs.docker.com/docker-hub/builds/advanced/#override-build-test-or-push-commands), which are executable bash files named after the command they are overriding and placed in a folder called `hooks/`.
