## Introduction

Simple chat application backend using Node.js, Express and Redis.

## Prepare for production

### Build docker image

docker build -t chat-app .

### Run docker container with environment file

docker run --env-file .env -p 3000:3000 chat-app