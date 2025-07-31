#!/bin/bash

# Set your Docker Hub username
DOCKER_USERNAME="jquintero"

# Set the image name and tag
IMAGE_NAME="istqb-assistant-frontend"
TAG="latest"

# Build the Docker image
echo "Building Docker image..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .

# Log in to Docker Hub
echo "Logging in to Docker Hub..."
docker login -u $DOCKER_USERNAME

# Push the image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG

echo "Done! Image pushed to Docker Hub: $DOCKER_USERNAME/$IMAGE_NAME:$TAG"
