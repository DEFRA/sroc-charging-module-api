#!/bin/bash

repo_name="environmentagency/charging-module-api"

git_image_tag="${repo_name}:${DOCKER_TAG}"

docker build --target production -t $DOCKER_TAG . --build-arg GIT_COMMIT=$SOURCE_COMMIT --build-arg DOCKER_TAG=$git_image_tag
