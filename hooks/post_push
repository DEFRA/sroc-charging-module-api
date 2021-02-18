#!/bin/bash

git_tag=$(git describe --always --tags)

docker tag $IMAGE_NAME $DOCKER_REPO:$git_tag
docker push $DOCKER_REPO:$git_tag
