#!/bin/bash
docker compose up -d
curl -s -o /dev/null --retry 5 --retry-all-errors --retry-delay 3 -f -k -u "redis@redis.com:redis" https://localhost:9443/v1/bootstrap
docker exec -it re1 /opt/redislabs/bin/rladmin cluster create name cluster.local username redis@redis.com password redis
sleep 5
curl -s -o /dev/null -k -u "redis@redis.com:redis" https://localhost:9443/v1/bdbs -H "Content-Type:application/json" -d @redb.json
sleep 1
docker exec -it rdi /bin/sh -c 'cd rdi_install/* && ./install.sh -f /opt/rdi_stage/silent.toml'