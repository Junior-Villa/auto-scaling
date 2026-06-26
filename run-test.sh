#!/bin/bash

URL=${TARGET_URL}
METHOD=${METHOD:-GET}
TOKEN=${TOKEN:-""}
BODY=${BODY:-""}

kubectl run k6 \
  --image=grafana/k6:latest \
  --restart=Never \
  -it --rm \
  --overrides="$(cat <<EOF
{
  "spec": {
    "containers": [{
      "name": "k6",
      "image": "grafana/k6:latest",
      "command": ["k6","run","/script/script.js"],
      "env": [
        {
          "name": "TARGET_URL",
          "value": "$URL"
        },
        {
          "name": "METHOD",
          "value": "$METHOD"
        },
        {
          "name": "TOKEN",
          "value": "$TOKEN"
        },
        {
          "name": "BODY",
          "value": "$BODY"
        }
      ],
      "volumeMounts": [{
        "name": "script",
        "mountPath": "/script"
      }]
    }],
    "volumes": [{
      "name": "script",
      "configMap": {
        "name": "k6-script"
      }
    }]
  }
}
EOF
)"
