# Hooks

As part of supporting client systems switching from [version 1](https://github.com/defra/charging-module-api) of the API to this one, we are providing access as a docker image available to download from [DockerHub](https://hub.docker.com/repository/docker/environmentagency/sroc-charging-module-api). And to ensure what is on DockerHub reflects the latest changes we have enabled [automated builds](https://docs.docker.com/docker-hub/builds/).

This folder and the files in it are specific to supporting building on DockerHub.

Because we need to the current git commit hash and docker tag as build args we need to override the default `docker build` used by DockerHub.

The mechanism for doing this are [hooks](https://docs.docker.com/docker-hub/builds/advanced/#override-build-test-or-push-commands), which are simply executable bash files named after the command they are overriding and placed in a folder called `hooks/`.
