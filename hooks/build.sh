#!/bin/bash

docker build --target production -t $IMAGE_NAME . --build-arg GIT_COMMIT=$SOURCE_COMMIT --build-arg DOCKER_TAG=$IMAGE_NAME
