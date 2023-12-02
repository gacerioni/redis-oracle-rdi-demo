#!/bin/bash
# Maker: Joey Whelan
# Usage: run.sh
# Description:  Shuts down Redis, DB, and Debezium containers

docker compose --profile oracle --profile debezium down