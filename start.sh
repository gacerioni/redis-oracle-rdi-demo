#!/bin/bash
# Maker: Joey Whelan
# Usage: start.sh
# Description:  Starts a 3-node Redis Enterprise cluster + Oracle Enterprise, builds a Redis target DB, 
# builds a source DB, builds a Redis DI sink DB, deploys Redis DI, starts a Debezium container

GEARS=redisgears_python.Linux-ubuntu18.04-x86_64.1.2.7.zip

if [ ! -f $GEARS ]
then
    echo "*** Fetch Gears  ***"
    wget https://redismodules.s3.amazonaws.com/redisgears/$GEARS 
fi

if [ ! -f redis-di ]
then
    echo "*** Fetch redis-di executable ***"
    wget -q https://qa-onprem.s3.amazonaws.com/redis-di/latest/redis-di-ubuntu20.04-latest.tar.gz -O - | tar -xz
fi

echo "*** Launch Redis Enterprise + Source DB Containers ***"
docker compose --profile oracle up -d

echo "*** Wait for Redis Enterprise to come up ***"
curl -s -o /dev/null --retry 5 --retry-all-errors --retry-delay 3 -f -k -u "redis@redis.com:redis" https://localhost:9443/v1/bootstrap

echo "*** Build Cluster ***"
docker exec -it re1 /opt/redislabs/bin/rladmin cluster create name cluster.local username redis@redis.com password redis
docker exec -it re2 /opt/redislabs/bin/rladmin cluster join nodes 192.168.20.2 username redis@redis.com password redis
docker exec -it re3 /opt/redislabs/bin/rladmin cluster join nodes 192.168.20.2 username redis@redis.com password redis

echo "*** Load Modules ***"
curl -s -o /dev/null -k -u "redis@redis.com:redis" https://localhost:9443/v2/modules -F module=@$GEARS

echo "*** Wait for Oracle to come up ***"
while ! docker logs --tail 100 oracle | grep -q "tail of the alert.log"
do
    sleep 10
done

echo "*** Build Target Redis DB ***"
curl -s -o /dev/null -k -u "redis@redis.com:redis" https://localhost:9443/v1/bdbs -H "Content-Type:application/json" -d @targetdb.json
sleep 1

echo "*** Build Redis DI DB for Ingress ***"
./redis-di create --silent --cluster-host localhost --cluster-api-port 9443 --cluster-user redis@redis.com \
--cluster-password redis --rdi-port 13000 --rdi-password redis

echo "*** Deploy Redis DI for Ingress ***"
./redis-di deploy --dir ./rdi --rdi-host localhost --rdi-port 13000 --rdi-password redis
    
echo "*** Start Debezium ***"
docker compose --profile debezium up -d

echo "*** Create Index for Scenario 8 ***"
npm run index

echo "*** Deploy Gears Function for Scenario 8 ***"
npm run deploy