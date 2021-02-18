#!/bin/bash

docker build --target production -t $DOCKER_TAG . --build-arg GIT_COMMIT=$SOURCE_COMMIT --build-arg DOCKER_TAG=$DOCKER_TAG
