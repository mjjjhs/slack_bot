#!/usr/bin/env bash

APPLICATION=$1
VERSION=$2
PHASE=$3
APP_MEMORY=${4:-1280}
NGINX_MEMORY=${5:-128}

SVC_PORT=8080
SVC_PORT_STORYBOOK=8081

SCRIPT_PATH=$(cd ${0%/*}; echo $PWD)

cat <<EOF > $SCRIPT_PATH/Dockerrun.aws.json
{
  "AWSEBDockerrunVersion": 2,
  "volumes": [
    {
      "name": "app-envs",
      "host": {
        "sourcePath": "/var/app/envs"
      }
    },
    {
      "name": "nginx-conf",
      "host": {
        "sourcePath": "/var/app/resolvers.conf"
      }
    }
  ],
  "containerDefinitions": [
    {
      "name": "app",
      "image": "docker-hub.yanolja.in/lqt/${APPLICATION}:${VERSION}",
      "environment": [
        {
          "name": "TZ",
          "value": "Asia/Seoul"
        },
        {
          "name": "PHASE",
          "value": "${PHASE}"
        }
      ],
      "memory": ${APP_MEMORY},
      "portMappings": [
        {
          "hostPort": ${SVC_PORT},
          "containerPort": ${SVC_PORT}
        },
        {
          "hostPort": ${SVC_PORT_STORYBOOK},
          "containerPort": ${SVC_PORT_STORYBOOK}
        }
      ],
      "mountPoints": [
        {
          "sourceVolume": "app-envs",
          "containerPath": "/var/app/envs"
        },
        {
          "sourceVolume": "awseb-logs-app",
          "containerPath": "/root/app/log"
        }
      ]
    },
    {
      "name": "nginx",
      "image": "docker-hub.yanolja.in/lqt/${APPLICATION}-nginx:${VERSION}",
      "environment": [
        {
          "name": "TZ",
          "value": "Asia/Seoul"
        }
      ],
      "memory": ${NGINX_MEMORY},
      "portMappings": [
        {
          "hostPort": 80,
          "containerPort": 80
        }
      ],
      "links": [
        "app"
      ],
      "mountPoints": [
        {
          "sourceVolume": "nginx-conf",
          "containerPath": "/etc/nginx/resolvers.conf",
          "readOnly": true
        },
        {
          "sourceVolume": "awseb-logs-nginx",
          "containerPath": "/var/log/nginx"
        }
      ]
    }
  ]
}
EOF
