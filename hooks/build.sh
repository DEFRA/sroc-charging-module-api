#!/bin/bash

docker build --target production . --build-arg GIT_COMMIT=$SOURCE_COMMIT --build-arg DOCKER_TAG=$DOCKER_TAG
