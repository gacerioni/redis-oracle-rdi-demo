#!/bin/bash
# Maker: Joey Whelan
# Usage: stop.sh
# Description:  Shuts down Redis, DB, and Debezium containers

docker compose --profile oracle --profile debezium down